# PowerShell deployment script for HUDAVERSE 2.0

Write-Host "🚀 HUDAVERSE 2.0 - Streak Tilawah Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📝 Files ready for deployment:" -ForegroundColor Green
Write-Host "- ✅ All HTML files configured for GitHub Pages" -ForegroundColor Green
Write-Host "- ✅ Streak Tilawah feature implemented" -ForegroundColor Green
Write-Host "- ✅ Real AI analysis with Gemini API" -ForegroundColor Green
Write-Host "- ✅ Voice recording functionality" -ForegroundColor Green
Write-Host "- ✅ Persistent localStorage" -ForegroundColor Green
Write-Host "- ✅ Production-ready (dev logs removed)" -ForegroundColor Green

Write-Host ""
$confirm = Read-Host "🤔 Ready to commit and push? (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host ""
    Write-Host "🔄 Adding all files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💬 Committing changes..." -ForegroundColor Yellow
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

    Write-Host ""
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin v2
    
    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Your site will be available at:" -ForegroundColor Cyan
    Write-Host "   https://idoo0.github.io/hudaverse/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔍 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check GitHub Pages deployment status" -ForegroundColor White
    Write-Host "2. Test the live site thoroughly" -ForegroundColor White
    Write-Host "3. Verify Streak Tilawah feature works" -ForegroundColor White
    Write-Host "4. Test AI analysis functionality" -ForegroundColor White
    Write-Host "5. Confirm voice recording works on mobile" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    Write-Host "📝 Review your changes and run this script again when ready." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Magenta
Write-Host "- ✅ Studio → Streak feature transformation" -ForegroundColor Green
Write-Host "- ✅ Real AI integration (Gemini API)" -ForegroundColor Green
Write-Host "- ✅ Voice recording functionality" -ForegroundColor Green
Write-Host "- ✅ Random surah selection" -ForegroundColor Green
Write-Host "- ✅ Persistent streak tracking" -ForegroundColor Green
Write-Host "- ✅ Production ready code" -ForegroundColor Green
Write-Host "- ✅ GitHub Pages configuration" -ForegroundColor Green