// ... existing code ...
useEffect(() => {
  if (typeof window !== 'undefined') {
    // Clear browser cache on load
    window.location.reload(true)
  }
}, [])
// ... existing code ...