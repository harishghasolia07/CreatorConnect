#!/bin/bash

echo "🧪 Testing CreatorConnect AI Implementation"
echo "=========================================="

# Test data for a sample brief
BRIEF_DATA='{
  "title": "Wedding Photography in Goa",
  "description": "Looking for an experienced wedding photographer to capture our beach wedding in Goa. We want candid, natural shots with a romantic feel.",
  "location": {"city": "Goa", "country": "India"},
  "category": "Photography",
  "preferredStyles": ["romantic", "candid", "natural"],
  "budgetMax": 75000,
  "startDate": "2025-03-15",
  "endDate": "2025-03-17",
  "clientName": "Test Client",
  "clientEmail": "test@example.com"
}'

echo "📤 Submitting test brief..."
echo "Brief: Wedding Photography in Goa"

RESPONSE=$(curl -s -X POST http://localhost:3001/api/briefs \
  -H "Content-Type: application/json" \
  -d "$BRIEF_DATA")

echo "📥 Response received:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "🔍 What to look for in the response:"
echo "✅ enhancedMatches - AI-powered results"
echo "✅ traditionalMatches - Rule-based results" 
echo "✅ aiEnabled: true - Confirms Gemini API is working"
echo "✅ Score breakdowns with ruleBasedScore and semanticScore"
echo "✅ AI-generated explanations"
