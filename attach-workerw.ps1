param([int]$hwnd)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win {
  [DllImport("user32.dll")] public static extern IntPtr FindWindowW(string lpClassName, string lpWindowName);
  [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeoutW(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint flags, uint timeout, out IntPtr result);
  public delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetClassNameW(IntPtr hWnd, System.Text.StringBuilder lpClassName, int nMaxCount);
  [DllImport("user32.dll")] public static extern IntPtr FindWindowExW(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);
  [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);
}
"@
$progman = [Win]::FindWindowW("Progman","Program Manager")
$null = [Win]::SendMessageTimeoutW($progman,0x052C,[IntPtr]::Zero,[IntPtr]::Zero,0,1000,[ref]([IntPtr]::Zero))

function Get-WorkerW {
  $script:worker = 0
  $delegate = [Win+EnumWindowsProc]{
    param([IntPtr]$h,[IntPtr]$l)
    $sb = New-Object System.Text.StringBuilder 256
    [Win]::GetClassNameW($h,$sb,$sb.Capacity) | Out-Null
    if($sb.ToString() -eq 'WorkerW'){
      $child = [Win]::FindWindowExW($h,[IntPtr]::Zero,'SHELLDLL_DefView',$null)
      if($child -eq [IntPtr]::Zero){
        $script:worker = $h
        return $false
      }
    }
    return $true
  }
  [Win]::EnumWindows($delegate,[IntPtr]::Zero) | Out-Null
  return $worker
}

$w = 0
for($i=0; $i -lt 20 -and $w -eq 0; $i++){
  $w = Get-WorkerW
  if($w -eq 0){ Start-Sleep -Milliseconds 100 }
}
if($w -ne 0 -and $hwnd -ne 0){
  [Win]::SetParent([IntPtr]$hwnd, [IntPtr]$w) | Out-Null
}
