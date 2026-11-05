# Downloads the WeCare website photos (free Unsplash licence) into a "photos" folder next to this script.
# Run: right-click this file > Run with PowerShell
$ErrorActionPreference = "Continue"
$dir = Join-Path $PSScriptRoot "photos"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$photos = @{
  "hero" = "https://images.unsplash.com/photo-1758691462863-9e1b8a863140?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "intro" = "https://images.unsplash.com/photo-1758691463000-08b98131daf3?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "introInset" = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "why" = "https://images.unsplash.com/photo-1666214278797-b2cc1b12be76?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "reception" = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "room" = "https://images.unsplash.com/photo-1778151270902-cb0ca572f2ee?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "consultRoom" = "https://images.unsplash.com/photo-1766299892549-b56b257d1ddd?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "diagnostics" = "https://images.unsplash.com/photo-1606206591513-adbfbdd7a177?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "waiting" = "https://images.unsplash.com/photo-1706458315547-1a60ada6d278?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "about" = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "aboutCorridor" = "https://images.unsplash.com/photo-1777269749032-d8d458ae594d?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "specialities" = "https://images.unsplash.com/photo-1758691462284-9eeec33fb0e7?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "doctors" = "https://images.unsplash.com/photo-1758691461957-474a7686e388?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "patients" = "https://images.unsplash.com/photo-1581982231900-6a1a46b744c9?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "appointment" = "https://images.unsplash.com/photo-1758691463198-dc663b8a64e4?auto=format&fit=crop&q=72&fm=jpg&w=1400"
  "contact" = "https://images.unsplash.com/photo-1764727291644-5dcb0b1a0375?auto=format&fit=crop&q=72&fm=jpg&w=1400"
}
$ok = 0
foreach ($name in $photos.Keys) {
  $out = Join-Path $dir "$name.jpg"
  try { Invoke-WebRequest -Uri $photos[$name] -OutFile $out -UseBasicParsing; $ok++; Write-Host "Saved $name" }
  catch { Write-Host "Could not download $name : $($_.Exception.Message)" }
}
Write-Host ""
Write-Host "$ok of $($photos.Count) photos saved to $dir. Tell Claude: done."
Read-Host "Press Enter to close"
