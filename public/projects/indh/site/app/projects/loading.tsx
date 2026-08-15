export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse flex items-center justify-center">
          <span className="text-white font-heading font-bold text-lg">I</span>
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Chargement...</p>
      </div>
    </div>
  )
}
