UPDATE valuation_template
SET textile_template = 'h1. Anàlisi

{{analysis}}

h3. Resum de tasques

{{taskSummary}}

h1. Pre-anàlisi

{{preAnalysis}}

h2. DB

{{db}}

h2. APIS

{{apis}}

h2. WEBS

{{webs}}

h2. Valoració

{{valuation}}',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Plantilla base'
  AND is_default = 1;
