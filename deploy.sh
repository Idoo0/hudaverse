#!/bin/bash
# Git deployment script for HUDAVERSE 2.0

echo "🚀 HUDAVERSE 2.0 - Streak Tilawah Deployment"
echo "============================================="

# Check git status
echo "📊 Checking git status..."
git status

echo ""
echo "📝 Files ready for deployment:"
echo "- ✅ All HTML files configured for GitHub Pages"
echo "- ✅ Streak Tilawah feature implemented"
echo "- ✅ Real AI analysis with Gemini API"
echo "- ✅ Voice recording functionality"
echo "- ✅ Persistent localStorage"
echo "- ✅ Production-ready (dev logs removed)"

echo ""
read -p "🤔 Ready to commit and push? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo ""
    echo "🔄 Adding all files..."
    git add .
    
    echo "💬 Committing changes..."
    git commit -m "feat: Add Streak Tilawah feature with AI voice recognition

- 🎯 Complete Studio → Streak transformation
- 🤖 Real AI analysis using Gemini API (not mock)
- 🎙️ Voice recording for Quranic recitation
- 📊 Personal streak tracking with fire emoji
- 🎲 Random surah selection (1-114)
- 💾 Persistent data with localStorage
- 🎨 Clean UI focused on personal progress
- 🧹 Production-ready (removed dev controls & logs)
- 🌐 GitHub Pages ready (base href enabled)

Features:
- Random verse challenge from 114 surahs
- Voice recording with Web Audio API
- AI-powered analysis with detailed feedback
- Streak counter with current/longest/total stats
- Recent sessions history
- Responsive design for all devices

Technical:
- Real Gemini API integration (same as Fahmi)
- LocalStorage for data persistence
- Error handling with fallback
- Production optimized code
- GitHub Pages deployment ready"

    echo ""
    echo "🚀 Pushing to GitHub..."
    git push origin v2
    
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Your site will be available at:"
    echo "   https://idoo0.github.io/hudaverse/"
    echo ""
    echo "🔍 Next steps:"
    echo "1. Check GitHub Pages deployment status"
    echo "2. Test the live site thoroughly"
    echo "3. Verify Streak Tilawah feature works"
    echo "4. Test AI analysis functionality"
    echo "5. Confirm voice recording works on mobile"
    
else
    echo ""
    echo "❌ Deployment cancelled."
    echo "📝 Review your changes and run this script again when ready."
fi

echo ""
echo "📋 Summary of changes:"
echo "- ✅ Studio → Streak feature transformation"
echo "- ✅ Real AI integration (Gemini API)"
echo "- ✅ Voice recording functionality"
echo "- ✅ Random surah selection"
echo "- ✅ Persistent streak tracking"
echo "- ✅ Production ready code"
echo "- ✅ GitHub Pages configuration"