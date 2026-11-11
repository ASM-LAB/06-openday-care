"use client";

import { useEffect, useId, useState } from "react";

const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon";

type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: { name: string };
  }>;
};

type PokemonResult =
  | { id: number; status: "success"; pokemon: Pokemon }
  | { id: number; status: "error"; error: string };

function capitalize(name: string) {
  return name.charAt(0).toLocaleUpperCase("es") + name.slice(1);
}

export default function Counter() {
  const [pokemonId, setPokemonId] = useState(1);
  const [result, setResult] = useState<PokemonResult | null>(null);
  const titleId = useId();

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    async function loadPokemon() {
      try {
        const response = await fetch(`${POKEMON_API_URL}/${pokemonId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (!ignore) {
            setResult({
              id: pokemonId,
              status: "error",
              error:
                response.status === 404
                  ? "No se pudo encontrar ese Pokémon."
                  : "No se pudo cargar el Pokémon. Inténtalo de nuevo.",
            });
          }
          return;
        }

        const pokemon = (await response.json()) as Pokemon;

        if (!ignore) {
          setResult({ id: pokemonId, status: "success", pokemon });
        }
      } catch {
        if (ignore || controller.signal.aborted) return;

        setResult({
          id: pokemonId,
          status: "error",
          error: "Ocurrió un error al cargar el Pokémon. Inténtalo de nuevo.",
        });
      }
    }

    void loadPokemon();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [pokemonId]);

  // `result.id` lets us detect stale data during render without extra state.
  const currentResult = result?.id === pokemonId ? result : null;
  const isLoading = currentResult === null;
  const pokemon =
    currentResult?.status === "success" ? currentResult.pokemon : null;
  const error = currentResult?.status === "error" ? currentResult.error : null;
  const displayName = pokemon ? capitalize(pokemon.name) : null;
  const image =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ??
    pokemon?.sprites.front_default;

  return (
    <section className="counter pokemonCounter" aria-labelledby={titleId}>
      <div className="pokemonCounterHeader">
        <h2 className="counterTitle pokemonCounterTitle" id={titleId}>
          Pokémon actual
        </h2>
        <span className="pokemonNumber" aria-label={`Número ${pokemonId}`}>
          #{String(pokemonId).padStart(3, "0")}
        </span>
      </div>

      <div
        className="pokemonDetails"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={isLoading}
      >
        {isLoading && (
          <p className="pokemonMessage" role="status">
            Cargando Pokémon…
          </p>
        )}

        {error && (
          <p className="pokemonMessage pokemonError" role="alert">
            {error}
          </p>
        )}

        {pokemon && (
          <>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="pokemonImage"
                src={image}
                alt={displayName ?? pokemon.name}
              />
            ) : (
              <div
                className="pokemonImage pokemonImageFallback"
                aria-hidden="true"
              >
                ?
              </div>
            )}
            <div className="pokemonInfo">
              <h3 className="pokemonName">{displayName}</h3>
              <ul className="pokemonTypes" aria-label="Tipos">
                {pokemon.types.map(({ type }) => (
                  <li className="pokemonType" key={type.name}>
                    {type.name}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="counterControls pokemonControls">
        <button
          className="counterButton pokemonNavButton"
          type="button"
          onClick={() => setPokemonId((current) => Math.max(1, current - 1))}
          disabled={pokemonId === 1}
          aria-label="Ver Pokémon anterior"
        >
          ← Anterior
        </button>
        <button
          className="counterButton counterButtonPrimary pokemonNavButton"
          type="button"
          onClick={() => setPokemonId((current) => current + 1)}
          aria-label="Ver Pokémon siguiente"
        >
          Siguiente →
        </button>
      </div>
    </section>
  );
}
