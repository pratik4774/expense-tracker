 
# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGODB_URI = os.getenv("MONGODB_URI")  # set this in .env
DB_NAME = os.getenv("DB_NAME", "expense_tracker_db")

if not MONGODB_URI:
    raise Exception("MONGODB_URI not set in environment. See .env.example")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
users_col = db["users"]
transactions_col = db["transactions"]

# Helper
def user_response(user_doc):
    return {
        "id": str(user_doc["_id"]),
        "name": user_doc.get("name"),
        "email": user_doc.get("email"),
        "balance": float(user_doc.get("balance", 0.0)),
    }

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error":"name, email and password are required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"error":"email already registered"}), 400

    hashed = generate_password_hash(password)
    new_user = {
        "name": name,
        "email": email,
        "password": hashed,
        "balance": 0.0
    }
    res = users_col.insert_one(new_user)
    user = users_col.find_one({"_id": res.inserted_id})
    return jsonify({"user": user_response(user)}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error":"email and password required"}), 400

    user = users_col.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error":"invalid credentials"}), 401

    return jsonify({"user": user_response(user)}), 200

@app.route("/api/transactions", methods=["GET", "POST", "DELETE"])
def transactions():
    # Expect "userId" in query param or JSON for actions
    if request.method == "GET":
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error":"userId required"}), 400
        txs = list(transactions_col.find({"userId": ObjectId(user_id)}).sort("createdAt", -1))
        for t in txs:
            t["id"] = str(t["_id"])
            t["userId"] = str(t["userId"])
            t.pop("_id", None)
        return jsonify({"transactions": txs}), 200

    if request.method == "POST":
        data = request.json
        user_id = data.get("userId")
        amount = data.get("amount")
        category = data.get("category", "general")
        note = data.get("note", "")
        tx_type = data.get("type")  # "expense" or "income"

        if not user_id or amount is None or not tx_type:
            return jsonify({"error":"userId, amount and type are required"}), 400

        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error":"user not found"}), 404

        amount = float(amount)
        # Update balance
        new_balance = float(user.get("balance", 0.0))
        if tx_type == "expense":
            new_balance -= amount
        else:
            new_balance += amount

        # Persist transaction
        tx_doc = {
            "userId": ObjectId(user_id),
            "amount": amount,
            "type": tx_type,
            "category": category,
            "note": note,
            "createdAt": request.json.get("createdAt") or None
        }
        res = transactions_col.insert_one(tx_doc)
        users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"balance": new_balance}})

        tx_doc["id"] = str(res.inserted_id)
        tx_doc["userId"] = user_id
        tx_doc.pop("_id", None)
        return jsonify({"transaction": tx_doc, "balance": new_balance}), 201

    if request.method == "DELETE":
        # expects JSON { "txId": "...", "userId": "..."}
        data = request.json
        tx_id = data.get("txId")
        user_id = data.get("userId")
        if not tx_id or not user_id:
            return jsonify({"error":"txId and userId required"}), 400

        tx = transactions_col.find_one({"_id": ObjectId(tx_id)})
        if not tx:
            return jsonify({"error":"transaction not found"}), 404

        # adjust balance (reverse the transaction)
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error":"user not found"}), 404

        bal = float(user.get("balance", 0.0))
        if tx["type"] == "expense":
            bal += float(tx["amount"])
        else:  # income
            bal -= float(tx["amount"])

        transactions_col.delete_one({"_id": ObjectId(tx_id)})
        users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"balance": bal}})

        return jsonify({"message":"deleted", "balance": bal}), 200

@app.route("/api/balance", methods=["GET", "PUT"])
def balance():
    if request.method == "GET":
        user_id = request.args.get("userId")
        if not user_id:
            return jsonify({"error":"userId required"}), 400
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error":"user not found"}), 404
        return jsonify({"balance": float(user.get("balance", 0.0))}), 200

    if request.method == "PUT":
        # top up: { userId, amount }
        data = request.json
        user_id = data.get("userId")
        amount = data.get("amount")
        if not user_id or amount is None:
            return jsonify({"error":"userId and amount required"}), 400
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error":"user not found"}), 404
        bal = float(user.get("balance", 0.0)) + float(amount)
        users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"balance": bal}})
        return jsonify({"balance": bal}), 200

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
