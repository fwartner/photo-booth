// In deiner src/app/confirm/page.tsx (vereinfacht)
export default function ConfirmPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Das generierte Bild wird hier angezeigt */}
      <img src={generatedImageUrl} alt="Dein Superheld" className="max-w-md" />

      {/* Das Formular für die Aktionen */}
      <form action="/api/confirm" method="POST" className="mt-8 space-y-4">
        
        {/* WICHTIG: Die Anzahl der Kopien - direkt über dem Druck-Button */}
        <div className="bg-blue-900/50 p-4 rounded-lg">
          <label className="block text-white mb-2 font-bold">
            Wie viele Fotos möchtest du drucken?
          </label>
          <select 
            name="copies" 
            className="w-full p-3 rounded bg-white text-black text-xl"
          >
            <option value="1">1x Ausdrucken</option>
            <option value="2">2x Ausdrucken</option>
            <option value="3">3x Ausdrucken</option>
            <option value="4">4x Ausdrucken</option>
          </select>
        </div>

        {/* E-Mail Eingabe */}
        <input 
          type="email" 
          name="email" 
          placeholder="Deine E-Mail Adresse"
          className="w-full p-3 rounded text-black"
        />

        {/* Die versteckten Felder, damit das Backend weiß, welches Foto gemeint ist */}
        <input type="hidden" name="session_id" value={sessionId} />
        <input type="hidden" name="print_photo" value="true" />

        {/* Der Absende-Button */}
        <button type="submit" className="bg-green-500 w-full py-4 text-2xl font-bold rounded">
          FOTO JETZT DRUCKEN!
        </button>
      </form>
    </div>
  );
}