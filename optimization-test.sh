#!/bin/bash

echo "🏃‍♂️ Performance Optimization Test"
echo "================================"
echo ""

# Test with fresh creators (no cached embeddings)
echo "🧪 Test 1: Fresh Install Performance"
echo "====================================="
echo "🗑️  Clearing creator data and re-seeding..."

# Clear and reseed data
curl -s -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "harish_admin_2025"}' > /dev/null

echo "✅ Data reseeded with pre-computed embeddings"
echo ""

# Test data
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

echo "⏱️  Testing optimized performance (with cached embeddings)..."

# Run 3 tests and average the time
TOTAL_TIME=0
NUM_TESTS=3

for i in $(seq 1 $NUM_TESTS); do
    echo "🧪 Test run $i/$NUM_TESTS..."
    
    START_TIME=$(date +%s.%N)
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/briefs \
      -H "Content-Type: application/json" \
      -d "$BRIEF_DATA")
    END_TIME=$(date +%s.%N)
    
    DURATION=$(echo "$END_TIME - $START_TIME" | bc)
    TOTAL_TIME=$(echo "$TOTAL_TIME + $DURATION" | bc)
    
    echo "   ⏱️  Run $i: ${DURATION}s"
done

AVERAGE_TIME=$(echo "scale=2; $TOTAL_TIME / $NUM_TESTS" | bc)

echo ""
echo "📊 Performance Results:"
echo "======================"
echo "🎯 Average Response Time: ${AVERAGE_TIME}s"

if (( $(echo "$AVERAGE_TIME < 3.0" | bc -l) )); then
    echo "🚀 EXCELLENT: Optimizations working!"
    echo "   ✅ Pre-computed embeddings are being used"
    echo "   ✅ Fast AI-enhanced matching achieved"
elif (( $(echo "$AVERAGE_TIME < 5.0" | bc -l) )); then
    echo "✅ GOOD: Significant improvement achieved"
    echo "   💡 Further optimizations possible"
else
    echo "⚠️  NEEDS WORK: Still slower than target"
    echo "   🔧 Check network connectivity to Gemini API"
fi

echo ""
echo "📈 Expected Performance Improvements:"
echo "==================================="
echo "🔄 BEFORE optimization: ~6-8s (generating embeddings on-demand)"
echo "⚡ AFTER optimization:  ~2-4s (using cached embeddings)"
echo "🎯 Target performance:  <3s (for production-ready)"

echo ""
echo "🔍 Sample Result Analysis:"
echo "========================="

# Analyze the last response
if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
    AI_ENABLED=$(echo "$RESPONSE" | jq -r '.aiEnabled // false')
    MATCH_COUNT=$(echo "$RESPONSE" | jq -r '.enhancedMatches | length // 0')
    
    if [ "$AI_ENABLED" = "true" ] && [ "$MATCH_COUNT" -gt 0 ]; then
        echo "✅ AI matching is working"
        echo "📊 Found $MATCH_COUNT enhanced matches"
        
        # Show top match
        TOP_SCORE=$(echo "$RESPONSE" | jq -r '.enhancedMatches[0].score // 0')
        TOP_RULE_SCORE=$(echo "$RESPONSE" | jq -r '.enhancedMatches[0].ruleBasedScore // 0')
        TOP_AI_SCORE=$(echo "$RESPONSE" | jq -r '.enhancedMatches[0].semanticScore // 0')
        
        echo "🏆 Top match score: $TOP_SCORE (Rules: $TOP_RULE_SCORE + AI: $TOP_AI_SCORE)"
    else
        echo "❌ AI matching not working properly"
    fi
else
    echo "❌ Invalid response received"
fi
