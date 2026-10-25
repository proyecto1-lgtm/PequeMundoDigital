-- Ejecutar una sola vez en Supabase > SQL Editor para permitir resultados de MiniExcel.
-- No elimina ni modifica los registros existentes.
alter table public.pmd_results drop constraint if exists pmd_results_game_check;
alter table public.pmd_results
  add constraint pmd_results_game_check
  check (game in ('keyboard', 'mouse', 'miniexcel'));
