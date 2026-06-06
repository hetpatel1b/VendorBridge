$file = "C:\Users\pc\.gemini\antigravity-ide\brain\55ac2b37-470d-4386-a3d9-11a714dcdd3d\hackathon_database_schema.md"
$content = [System.IO.File]::ReadAllText($file)

# Replace non-hex UUID prefixes with valid hex equivalents
# Order: longer/compound prefixes first to avoid partial matches
$content = $content.Replace('ri000000-0000-0000-0000-', 'd0000000-0000-0000-0000-')
$content = $content.Replace('ap000000-0000-0000-0000-', 'ab000000-0000-0000-0000-')
$content = $content.Replace('v0000000-0000-0000-0000-', 'b0000000-0000-0000-0000-')
$content = $content.Replace('r0000000-0000-0000-0000-', 'c0000000-0000-0000-0000-')
$content = $content.Replace('q0000000-0000-0000-0000-', 'e0000000-0000-0000-0000-')
$content = $content.Replace('p0000000-0000-0000-0000-', 'f0000000-0000-0000-0000-')
$content = $content.Replace('i0000000-0000-0000-0000-', '10000000-0000-0000-0000-')

[System.IO.File]::WriteAllText($file, $content)
Write-Host "Replaced UUID prefixes in artifact file"

# Count occurrences to verify
$prefixes = @('a0000000-', 'b0000000-', 'c0000000-', 'd0000000-', 'e0000000-', 'f0000000-', '10000000-', 'ab000000-')
foreach ($p in $prefixes) {
    $count = ([regex]::Matches($content, [regex]::Escape($p))).Count
    if ($count -gt 0) {
        Write-Host "  $p : $count occurrences"
    }
}

# Check for any remaining invalid prefixes
$invalid = @('v0000000-', 'r0000000-', 'q0000000-', 'p0000000-', 'i0000000-', 'ri000000-', 'ap000000-')
$hasErrors = $false
foreach ($p in $invalid) {
    $count = ([regex]::Matches($content, [regex]::Escape($p))).Count
    if ($count -gt 0) {
        Write-Host "  WARNING: $p still has $count occurrences!" -ForegroundColor Red
        $hasErrors = $true
    }
}
if (-not $hasErrors) {
    Write-Host "All invalid UUID prefixes successfully replaced!" -ForegroundColor Green
}
