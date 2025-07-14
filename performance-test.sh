#!/bin/bash

echo "⚡ CreatorConnect Performance Testing"
echo "===================================="
echo ""

# Test data for comparison
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

echo "🧪 Test 1: Performance Measurement"
echo "================================"
echo "📤 Submitting brief and measuring response time..."

# Measure response time
START_TIME=$(date +%s.%N)
RESPONSE=$(curl -s -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d "$BRIEF_DATA")
END_TIME=$(date +%s.%N)

# Calculate duration
DURATION=$(echo "$END_TIME - $START_TIME" | bc)

echo "⏱️  Response Time: ${DURATION} seconds"
echo ""

echo "📊 Response Analysis:"
echo "==================="

# Check if response is valid JSON
if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
    # Extract key metrics
    AI_ENABLED=$(echo "$RESPONSE" | jq -r '.aiEnabled // false')
    ENHANCED_COUNT=$(echo "$RESPONSE" | jq -r '.enhancedMatches | length // 0')
    TRADITIONAL_COUNT=$(echo "$RESPONSE" | jq -r '.traditionalMatches | length // 0')
    
    echo "✅ AI Enabled: $AI_ENABLED"
    echo "📈 Enhanced Matches: $ENHANCED_COUNT"
    echo "📊 Traditional Matches: $TRADITIONAL_COUNT"
    
    if [ "$AI_ENABLED" = "true" ]; then
        echo ""
        echo "🎯 Sample Enhanced Match Analysis:"
        echo "================================"
        
        # Get first match details
        FIRST_MATCH=$(echo "$RESPONSE" | jq -r '.enhancedMatches[0]')
        TOTAL_SCORE=$(echo "$FIRST_MATCH" | jq -r '.score // 0')
        RULE_SCORE=$(echo "$FIRST_MATCH" | jq -r '.ruleBasedScore // 0')
        AI_SCORE=$(echo "$FIRST_MATCH" | jq -r '.semanticScore // 0')
        CREATOR_NAME=$(echo "$FIRST_MATCH" | jq -r '.creator.name // "Unknown"')
        
        echo "👤 Creator: $CREATOR_NAME"
        echo "🏆 Total Score: $TOTAL_SCORE"
        echo "📏 Rule-based Score: $RULE_SCORE"
        echo "🤖 AI Semantic Score: $AI_SCORE"
        echo "💡 Enhancement: +$(echo "$AI_SCORE" | bc) points from AI"
        
        # Show explanation preview
        echo ""
        echo "🔍 AI Explanation Preview:"
        echo "$FIRST_MATCH" | jq -r '.explanation // "No explanation"' | head -c 100
        echo "..."
    else
        echo "⚠️  AI features not enabled (check Gemini API key)"
    fi
else
    echo "❌ Invalid JSON response or error occurred"
    echo "Response: $RESPONSE"
fi

echo ""
echo "📈 Performance Comparison:"
echo "========================"

if (( $(echo "$DURATION > 5.0" | bc -l) )); then
    echo "🐌 SLOW (>5s): Response time indicates performance bottleneck"
    echo "   Likely causes:"
    echo "   • Sequential API calls to Gemini"
    echo "   • Missing creator embeddings (generating on-demand)"
    echo "   • Network latency to AI API"
elif (( $(echo "$DURATION > 2.0" | bc -l) )); then
    echo "⚠️  MODERATE (2-5s): Acceptable for AI-enhanced matching"
    echo "   • AI processing adds computational overhead"
    echo "   • Consider caching embeddings for better performance"
else
    echo "⚡ FAST (<2s): Excellent performance!"
    echo "   • Likely using cached embeddings"
    echo "   • Optimized AI processing pipeline"
fi

echo ""
echo "🔧 Optimization Recommendations:"
echo "==============================="
echo "1. 🏃‍♂️ Pre-compute creator embeddings during seeding"
echo "2. ⚡ Batch AI API calls instead of sequential"
echo "3. 🗃️  Cache semantic scores for popular brief types"
echo "4. 🎯 Limit AI processing to top rule-based matches"
echo "5. ⏰ Add timeout handling for AI API calls"

echo ""
echo "🆚 Key Differences from Previous Method:"
echo "======================================="
echo ""
echo "📊 BEFORE (Rule-based only):"
echo "  • ⚡ Fast: ~0.5-1s response time"
echo "  • 📏 Simple scoring: 0-20 points"
echo "  • 🔢 Basic explanations: Bullet points"
echo "  • 🎯 Logic: Location + Category + Budget + Skills match"
echo ""
echo "🤖 NOW (AI-Enhanced):"
echo "  • 🐌 Slower: ~2-8s response time"
echo "  • 📈 Rich scoring: 0-30 points (20 rules + 10 AI)"
echo "  • 💬 Smart explanations: Natural language from Gemini"
echo "  • 🧠 Logic: Rules + Semantic understanding + Context"
echo ""
echo "💡 The slowdown is EXPECTED and VALUABLE because:"
echo "  ✅ AI understands project context better"
echo "  ✅ Finds creators with subtle skill matches"
echo "  ✅ Provides intelligent explanations"
echo "  ✅ Learns from feedback for future improvements"
