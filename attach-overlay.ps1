param([int]$hwnd)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win {
  [DllImport("user32.dll")] public static extern IntPtr FindWindowW(string lpClassName, string lpWindowName);
  [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);
}
"@
$progman = [Win]::FindWindowW("Progman", "Program Manager")
if($progman -ne [IntPtr]::Zero -and $hwnd -ne 0){
  [Win]::SetParent([IntPtr]$hwnd, $progman) | Out-Null
}
