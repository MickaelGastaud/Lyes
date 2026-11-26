/** Barre de recherche unique : le client écrit ce qu'il veut, en français courant. */
export function SearchBar({ defaultValue = "", size = "lg" }: { defaultValue?: string; size?: "lg" | "md" }) {
  const big = size === "lg";
  return (
    <form action="/voitures" method="get" className={`flex w-full gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-sand ${big ? "md:p-3" : ""}`}>
      <label htmlFor="q" className="sr-only">
        Que recherchez-vous ?
      </label>
      <input
        id="q"
        name="q"
        defaultValue={defaultValue}
        placeholder="Ex. : SUV hybride familial, moins de 35 000 €, automatique"
        className={`min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-muted/70 ${big ? "py-3 text-base md:text-lg" : "py-2 text-sm"}`}
      />
      <button type="submit" className={`btn-brass shrink-0 ${big ? "px-6 text-base" : ""}`}>
        Rechercher
      </button>
    </form>
  );
}
