// Copa 2026 Album — 901 stickers total
// Special group: FWC1-19 (19), CC1-14 (14)
// Groups A-L: 4 countries × 20 stickers each

window.ALBUM = (() => {
  const groups = [
    {
      id: "ESP",
      label: "Especial",
      countries: [
        { code: "FWC", name: "FIFA History", flag: "🏆", count: 19 },
        { code: "CC",  name: "Coca-Cola",   flag: "🥤", count: 14 },
      ],
    },
    {
      id: "A",
      label: "A",
      countries: [
        { code: "MEX", name: "México",        flag: "🇲🇽", count: 20 },
        { code: "RSA", name: "África do Sul", flag: "🇿🇦", count: 20 },
        { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷", count: 20 },
        { code: "CZE", name: "Rep. Tcheca",   flag: "🇨🇿", count: 20 },
      ],
    },
    {
      id: "B",
      label: "B",
      countries: [
        { code: "CAN", name: "Canadá",  flag: "🇨🇦", count: 20 },
        { code: "BIH", name: "Bósnia",  flag: "🇧🇦", count: 20 },
        { code: "QAT", name: "Catar",   flag: "🇶🇦", count: 20 },
        { code: "SUI", name: "Suíça",   flag: "🇨🇭", count: 20 },
      ],
    },
    {
      id: "C",
      label: "C",
      countries: [
        { code: "BRA", name: "Brasil",   flag: "🇧🇷", count: 20 },
        { code: "MAR", name: "Marrocos", flag: "🇲🇦", count: 20 },
        { code: "HAI", name: "Haiti",    flag: "🇭🇹", count: 20 },
        { code: "SCO", name: "Escócia",  flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", count: 20 },
      ],
    },
    {
      id: "D",
      label: "D",
      countries: [
        { code: "USA", name: "Estados Unidos", flag: "🇺🇸", count: 20 },
        { code: "PAR", name: "Paraguai",       flag: "🇵🇾", count: 20 },
        { code: "AUS", name: "Austrália",      flag: "🇦🇺", count: 20 },
        { code: "TUR", name: "Turquia",        flag: "🇹🇷", count: 20 },
      ],
    },
    {
      id: "E",
      label: "E",
      countries: [
        { code: "GER", name: "Alemanha",        flag: "🇩🇪", count: 20 },
        { code: "CUW", name: "Curaçao",         flag: "🇨🇼", count: 20 },
        { code: "CIV", name: "Costa do Marfim", flag: "🇨🇮", count: 20 },
        { code: "ECU", name: "Equador",         flag: "🇪🇨", count: 20 },
      ],
    },
    {
      id: "F",
      label: "F",
      countries: [
        { code: "NED", name: "Holanda", flag: "🇳🇱", count: 20 },
        { code: "JPN", name: "Japão",   flag: "🇯🇵", count: 20 },
        { code: "SWE", name: "Suécia",  flag: "🇸🇪", count: 20 },
        { code: "TUN", name: "Tunísia", flag: "🇹🇳", count: 20 },
      ],
    },
    {
      id: "G",
      label: "G",
      countries: [
        { code: "BEL", name: "Bélgica",      flag: "🇧🇪", count: 20 },
        { code: "EGY", name: "Egito",        flag: "🇪🇬", count: 20 },
        { code: "IRN", name: "Irã",          flag: "🇮🇷", count: 20 },
        { code: "NZL", name: "Nova Zelândia",flag: "🇳🇿", count: 20 },
      ],
    },
    {
      id: "H",
      label: "H",
      countries: [
        { code: "ESP_", name: "Espanha",         flag: "🇪🇸", count: 20 },
        { code: "CPV", name: "Cabo Verde",      flag: "🇨🇻", count: 20 },
        { code: "KSA", name: "Arábia Saudita",  flag: "🇸🇦", count: 20 },
        { code: "URU", name: "Uruguai",         flag: "🇺🇾", count: 20 },
      ],
    },
    {
      id: "I",
      label: "I",
      countries: [
        { code: "FRA", name: "França",   flag: "🇫🇷", count: 20 },
        { code: "SEN", name: "Senegal",  flag: "🇸🇳", count: 20 },
        { code: "IRQ", name: "Iraque",   flag: "🇮🇶", count: 20 },
        { code: "NOR", name: "Noruega",  flag: "🇳🇴", count: 20 },
      ],
    },
    {
      id: "J",
      label: "J",
      countries: [
        { code: "ARG", name: "Argentina", flag: "🇦🇷", count: 20 },
        { code: "ALG", name: "Argélia",   flag: "🇩🇿", count: 20 },
        { code: "AUT", name: "Áustria",   flag: "🇦🇹", count: 20 },
        { code: "JOR", name: "Jordânia",  flag: "🇯🇴", count: 20 },
      ],
    },
    {
      id: "K",
      label: "K",
      countries: [
        { code: "POR", name: "Portugal",     flag: "🇵🇹", count: 20 },
        { code: "COD", name: "Congo",        flag: "🇨🇩", count: 20 },
        { code: "UZB", name: "Uzbequistão",  flag: "🇺🇿", count: 20 },
        { code: "COL", name: "Colômbia",     flag: "🇨🇴", count: 20 },
      ],
    },
    {
      id: "L",
      label: "L",
      countries: [
        { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", count: 20 },
        { code: "CRO", name: "Croácia",    flag: "🇭🇷", count: 20 },
        { code: "GHA", name: "Gana",       flag: "🇬🇭", count: 20 },
        { code: "PAN", name: "Panamá",     flag: "🇵🇦", count: 20 },
      ],
    },
  ];

  // Spec has code "ESP" for Espanha; we used ESP_ to avoid clash with group id.
  // Re-correct: rename back to ESP for the sticker code prefix.
  groups.find(g => g.id === "H").countries[0].code = "ESP";

  // Flatten: ordered list of countries across all groups
  const countries = [];
  groups.forEach(g => {
    g.countries.forEach(c => {
      countries.push({ ...c, group: g.id, groupLabel: g.label });
    });
  });

  // Total
  const total = countries.reduce((s, c) => s + c.count, 0);

  // Sticker code generator: e.g. MEX1, FWC19
  const stickerCode = (countryCode, n) => `${countryCode}${n}`;

  return { groups, countries, total, stickerCode };
})();
