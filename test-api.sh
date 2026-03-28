#!/bin/bash
# Quick test script to verify login endpoint

echo "Testing Meeting Tracker API..."
echo ""

echo "1. Testing Login Endpoint:"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "2. Testing Health Check:"
curl http://localhost:5000/api/health
