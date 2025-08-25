export interface Intervention {
  date: string;
  technicianName: string;
  clientName: string;
  adresse: string;
  heure: string;
  interId:number
}

export const cards: Intervention[] = [
    {
      date: "08-08-2025",
      technicianName: "Saadia Boussiar",
      clientName: "Ilyass Boussiar",
      adresse: "Tassila, Agadir",
      heure: "10h30",
      interId:2567
    },
    {
      date: "09-08-2025",
      technicianName: "John Doe",
      clientName: "Jane Smith",
      adresse: "Downtown, Casablanca",
      heure: "14h00",
      interId:456
    },
    {
      date: "10-08-2025",
      technicianName: "Ahmed El Amrani",
      clientName: "Fatima Zahra",
      adresse: "Hay Mohammadi, Marrakech",
      heure: "09h15",
      interId:123
    },
    {
      date: "11-08-2025",
      technicianName: "layth Martin",
      clientName: "Pierre Dupont",
      adresse: "Corniche, Tangier",
      heure: "16h45",
      interId:789
    },
    {
      date: "12-08-2025",
      technicianName: "Karim Benali",
      clientName: "Salma El Fassi",
      adresse: "Centre-ville, Rabat",
      heure: "11h00",
      interId:90
    },
    {
      date: "13-08-2025",
      technicianName: "Hassan Othman",
      clientName: "Mohamed Idrissi",
      adresse: "Avenue Mohammed V, Fès",
      heure: "13h30",
      interId:896
    },
    {
      date: "14-08-2025",
      technicianName: "Emma Johnson",
      clientName: "Lucas Bernard",
      adresse: "Zone Industrielle, Kenitra",
      heure: "08h45",
      interId:567
    },
    {
      date: "15-08-2025",
      technicianName: "Nadia Kabbaj",
      clientName: "Omar El Mansouri",
      adresse: "Quartier Administratif, Oujda",
      heure: "15h20",
      interId:563
    },
  ];
