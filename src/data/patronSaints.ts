/**
 * Greek Towns Patron Saints Database
 * Updated from Wikipedia: https://el.wikipedia.org/wiki/Κατάλογος_πόλεων_και_πολιούχων_αγίων
 *
 * This is a comprehensive list of Greek cities/towns and their patron saints.
 * The feast day (date) is when the town celebrates - usually an official local holiday.
 *
 * Note: Some patron saint dates are movable (Easter-dependent).
 * For these, isMovable is true and a typical fixed date is provided.
 */

export interface PatronSaint {
  town: string
  townGreek: string
  saint: string
  saintGreek: string
  date: string // MM-DD format (fallback date for movable feasts)
  isMovable?: boolean // True if Easter-dependent
  easterOffset?: number // Days from Easter for movable feasts
}

export const patronSaints: PatronSaint[] = [
  // === Α ===
  {
    town: 'Athens',
    townGreek: 'Αθήνα',
    saint: 'Saint Dionysios the Areopagite',
    saintGreek: 'Άγιος Διονύσιος ο Αρεοπαγίτης',
    date: '10-03'
  },
  {
    town: 'Alistriti',
    townGreek: 'Αλιστράτη',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Amaliada',
    townGreek: 'Αμαλιάδα',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Amphilochia',
    townGreek: 'Αμφιλοχία',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Amygdaleonas Kavalas',
    townGreek: 'Αμυγδαλεώνας Καβάλας',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Andros',
    townGreek: 'Άνδρος',
    saint: 'Panagia Theoskepasti',
    saintGreek: 'Παναγία Θεοσκέπαστη',
    date: '03-07',
    isMovable: true,
    easterOffset: -41 // Monday of Apokreos (Carnival)
  },
  {
    town: 'Agioi Anargyroi Attikis',
    townGreek: 'Άγιοι Ανάργυροι Αττικής',
    saint: 'Saints Anargyroi (Kosmas & Damianos)',
    saintGreek: 'Άγιοι Ανάργυροι',
    date: '11-01'
  },
  {
    town: 'Agia Varvara Attikis',
    townGreek: 'Αγία Βαρβάρα Αττικής',
    saint: 'Saint Barbara',
    saintGreek: 'Αγία Βαρβάρα',
    date: '12-04'
  },
  {
    town: 'Agia Paraskevi Thessalonikis',
    townGreek: 'Αγία Παρασκευή Θεσσαλονίκης',
    saint: 'Zoodochos Pigi (Life-giving Spring)',
    saintGreek: 'Ζωοδόχος Πηγή',
    date: '04-20',
    isMovable: true,
    easterOffset: 5 // Bright Friday (Friday after Easter)
  },
  {
    town: 'Aigina',
    townGreek: 'Αίγινα',
    saint: 'Saint Nektarios',
    saintGreek: 'Άγιος Νεκτάριος',
    date: '11-09'
  },
  {
    town: 'Aigio',
    townGreek: 'Αίγιο',
    saint: 'Panagia Trypiti',
    saintGreek: 'Παναγία Τρυπητή',
    date: '04-20',
    isMovable: true,
    easterOffset: 5 // Bright Friday (Friday after Easter)
  },
  {
    town: 'Aitoliko',
    townGreek: 'Αιτωλικό',
    saint: 'Archangels Michael and Gabriel',
    saintGreek: 'Αρχάγγελοι Μιχαήλ και Γαβριήλ',
    date: '11-08'
  },
  {
    town: 'Alexandroupoli',
    townGreek: 'Αλεξανδρούπολη',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Argos',
    townGreek: 'Άργος',
    saint: 'Saint Peter',
    saintGreek: 'Άγιος Πέτρος',
    date: '06-29'
  },
  {
    town: 'Argyroupoli',
    townGreek: 'Αργυρούπολη',
    saint: 'Saint Barbara',
    saintGreek: 'Αγία Βαρβάρα',
    date: '12-04'
  },
  {
    town: 'Arta',
    townGreek: 'Άρτα',
    saint: 'Saint Theodora',
    saintGreek: 'Αγία Θεοδώρα',
    date: '03-11'
  },
  {
    town: 'Astypalaia',
    townGreek: 'Αστυπάλαια',
    saint: 'Osios Anthimos',
    saintGreek: 'Όσιος Άνθιμος',
    date: '09-04'
  },
  {
    town: 'Asprovalta',
    townGreek: 'Ασπροβάλτα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  // === Β ===
  {
    town: 'Veria',
    townGreek: 'Βέροια',
    saint: 'Osios Antonios the New',
    saintGreek: 'Όσιος Αντώνιος ο νέος',
    date: '01-17'
  },
  {
    town: 'Volos',
    townGreek: 'Βόλος',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Vonitsa',
    townGreek: 'Βόνιτσα',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Vrachneika',
    townGreek: 'Βραχνέικα',
    saint: 'Saint Basil',
    saintGreek: 'Άγιος Βασίλειος',
    date: '01-01'
  },
  // === Γ ===
  {
    town: 'Gargalianoi',
    townGreek: 'Γαργαλιάνοι',
    saint: 'Saint Dionysios the Areopagite',
    saintGreek: 'Άγιος Διονύσιος ο Αρεοπαγίτης',
    date: '10-03'
  },
  {
    town: 'Goumenissa',
    townGreek: 'Γουμένισσα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Grevena',
    townGreek: 'Γρεβενά',
    saint: 'Saint Achilleios',
    saintGreek: 'Άγιος Αχίλλειος',
    date: '05-15'
  },
  {
    town: 'Gythio',
    townGreek: 'Γύθειο',
    saint: 'Hypapante (Presentation of Christ)',
    saintGreek: 'Υπαπαντή του Κυρίου',
    date: '02-02'
  },
  // === Δ ===
  {
    town: 'Didymoteicho',
    townGreek: 'Διδυμότειχο',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Doxato',
    townGreek: 'Δοξάτο',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '05-02'
  },
  {
    town: 'Drama',
    townGreek: 'Δράμα',
    saint: 'Saint Barbara',
    saintGreek: 'Αγία Βαρβάρα',
    date: '12-04'
  },
  // === Ε ===
  {
    town: 'Edessa',
    townGreek: 'Έδεσσα',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Elassona',
    townGreek: 'Ελασσόνα',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Elefsis (Elefsina)',
    townGreek: 'Ελευσίνα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Elafonissos',
    townGreek: 'Ελαφόνησος',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Eratyra',
    townGreek: 'Εράτυρα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  // === Ζ ===
  {
    town: 'Zakynthos',
    townGreek: 'Ζάκυνθος',
    saint: 'Saint Dionysios',
    saintGreek: 'Άγιος Διονύσιος',
    date: '12-17'
  },
  {
    town: 'Zografou Attikis',
    townGreek: 'Ζωγράφου Αττικής',
    saint: 'Saint Therapon',
    saintGreek: 'Άγιος Θεράπων',
    date: '05-14'
  },
  // === Η ===
  {
    town: 'Heraklion',
    townGreek: 'Ηράκλειο',
    saint: 'Saint Minas',
    saintGreek: 'Άγιος Μηνάς',
    date: '11-11'
  },
  // === Θ ===
  {
    town: 'Thessaloniki',
    townGreek: 'Θεσσαλονίκη',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Thebes (Thiva)',
    townGreek: 'Θήβα',
    saint: 'Saint Luke',
    saintGreek: 'Άγιος Λουκάς',
    date: '10-18'
  },
  // === Ι ===
  {
    town: 'Iasmos',
    townGreek: 'Ίασμος',
    saint: 'Prophet Elias',
    saintGreek: 'Προφήτης Ηλίας',
    date: '07-20'
  },
  {
    town: 'Ierapetra',
    townGreek: 'Ιεράπετρα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Ikaria',
    townGreek: 'Ικαρία',
    saint: 'Saint Kirykos',
    saintGreek: 'Άγιος Κήρυκος',
    date: '07-15'
  },
  {
    town: 'Ioannina',
    townGreek: 'Ιωάννινα',
    saint: 'Saint George the Neomartyr',
    saintGreek: 'Νεομάρτυς Άγιος Γεώργιος',
    date: '01-17'
  },
  {
    town: 'Istiaia',
    townGreek: 'Ιστιαία',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  // === Κ ===
  {
    town: 'Kavala',
    townGreek: 'Καβάλα',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Kalamata',
    townGreek: 'Καλαμάτα',
    saint: 'Hypapante (Presentation of Christ)',
    saintGreek: 'Υπαπαντή του Κυρίου',
    date: '02-02'
  },
  {
    town: 'Kalampaka',
    townGreek: 'Καλαμπάκα',
    saint: 'Saint Bessarion',
    saintGreek: 'Άγιος Βησσαρίων',
    date: '09-15'
  },
  {
    town: 'Kalavryta',
    townGreek: 'Καλάβρυτα',
    saint: 'Saint Alexios',
    saintGreek: 'Άγιος Αλέξιος',
    date: '03-17'
  },
  {
    town: 'Kalymnos',
    townGreek: 'Κάλυμνος',
    saint: 'Holy Cross',
    saintGreek: 'Τίμιος Σταυρός',
    date: '09-14'
  },
  {
    town: 'Karditsa',
    townGreek: 'Καρδίτσα',
    saint: 'Saint Seraphim',
    saintGreek: 'Άγιος Σεραφείμ',
    date: '12-04'
  },
  {
    town: 'Karpenisi',
    townGreek: 'Καρπενήσι',
    saint: 'Saint Nikolaos Karpenisiotes',
    saintGreek: 'Άγιος Νικόλαος ο Καρπενησιώτης',
    date: '09-23'
  },
  {
    town: 'Karpathos',
    townGreek: 'Κάρπαθος',
    saint: 'Assumption of Mary',
    saintGreek: 'Κοίμηση της Θεοτόκου',
    date: '08-15'
  },
  {
    town: 'Karytaina',
    townGreek: 'Καρύταινα',
    saint: 'Saint Athanasios of Christianoupolis',
    saintGreek: 'Άγιος Αθανάσιος Χριστιανουπόλεως',
    date: '05-17'
  },
  {
    town: 'Kastoria',
    townGreek: 'Καστοριά',
    saint: 'Virgin Mary Mavriotissa',
    saintGreek: 'Παναγία Μαυριώτισσα',
    date: '08-15'
  },
  {
    town: 'Katerini',
    townGreek: 'Κατερίνη',
    saint: 'Saint Catherine',
    saintGreek: 'Αγία Αικατερίνη',
    date: '11-25'
  },
  {
    town: 'Kea',
    townGreek: 'Κέα',
    saint: 'Saint Charalambos',
    saintGreek: 'Άγιος Χαράλαμπος',
    date: '02-10'
  },
  {
    town: 'Kefalonia',
    townGreek: 'Κεφαλονιά',
    saint: 'Saint Gerasimos',
    saintGreek: 'Άγιος Γεράσιμος',
    date: '10-20'
  },
  {
    town: 'Keratea',
    townGreek: 'Κερατέα',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Corfu (Kerkyra)',
    townGreek: 'Κέρκυρα',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Kifisia',
    townGreek: 'Κηφισιά',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Kimolos',
    townGreek: 'Κίμωλος',
    saint: 'Panagia Odigitria',
    saintGreek: 'Παναγία Οδηγήτρια',
    date: '11-21'
  },
  {
    town: 'Kissamos',
    townGreek: 'Κίσσαμος',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Kokkino Choma Kavalas',
    townGreek: 'Κοκκινόχωμα Καβάλας',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Kolindros',
    townGreek: 'Κολινδρός',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Komotini',
    townGreek: 'Κομοτηνή',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Koroni',
    townGreek: 'Κορώνη',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Kos',
    townGreek: 'Κως',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Koufalia',
    townGreek: 'Κουφάλια',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Kozani',
    townGreek: 'Κοζάνη',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Kymi',
    townGreek: 'Κύμη',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Kyparissia',
    townGreek: 'Κυπαρισσία',
    saint: 'Saint Athanasios of Christianoupolis',
    saintGreek: 'Άγιος Αθανάσιος Χριστιανουπόλεως',
    date: '05-17'
  },
  // === Λ ===
  {
    town: 'Lagkadas',
    townGreek: 'Λαγκαδάς',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Lamia',
    townGreek: 'Λαμία',
    saint: 'Saint Luke',
    saintGreek: 'Άγιος Λουκάς',
    date: '10-18'
  },
  {
    town: 'Larissa',
    townGreek: 'Λάρισα',
    saint: 'Saint Achilleios',
    saintGreek: 'Άγιος Αχίλλειος',
    date: '05-15'
  },
  {
    town: 'Lefkada',
    townGreek: 'Λευκάδα',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Leros',
    townGreek: 'Λέρος',
    saint: 'Panagia tou Kastrou',
    saintGreek: 'Παναγία του Κάστρου',
    date: '08-15'
  },
  {
    town: 'Leipsoi',
    townGreek: 'Λειψοί',
    saint: 'Saint John the Theologian',
    saintGreek: 'Άγιος Ιωάννης ο Θεολόγος',
    date: '09-26'
  },
  {
    town: 'Litochoro',
    townGreek: 'Λιτόχωρο',
    saint: 'Osios Dionysios of Olympus',
    saintGreek: 'Όσιος Διονύσιος ο εν Ολύμπω',
    date: '01-23'
  },
  {
    town: 'Livadeia',
    townGreek: 'Λιβαδειά',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Loutraki',
    townGreek: 'Λουτράκι',
    saint: 'Panagia Giatrissa',
    saintGreek: 'Παναγία Γιάτρισσα',
    date: '09-08'
  },
  {
    town: 'Lykóvrysi',
    townGreek: 'Λυκόβρυση',
    saint: 'Saint Barbara',
    saintGreek: 'Αγία Βαρβάρα',
    date: '12-04'
  },
  // === Μ ===
  {
    town: 'Messolonghi',
    townGreek: 'Μεσολόγγι',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Milos',
    townGreek: 'Μήλος',
    saint: 'Holy Trinity',
    saintGreek: 'Αγία Τριάδα',
    date: '06-16',
    isMovable: true,
    easterOffset: 49 // Pentecost Sunday
  },
  {
    town: 'Mykonos',
    townGreek: 'Μύκονος',
    saint: 'Saint Artemios',
    saintGreek: 'Άγιος Αρτέμιος',
    date: '10-20'
  },
  {
    town: 'Mytilene (Lesvos)',
    townGreek: 'Μυτιλήνη',
    saint: 'Archangels Michael and Gabriel',
    saintGreek: 'Αρχάγγελοι Μιχαήλ και Γαβριήλ',
    date: '11-08'
  },
  // === Ν ===
  {
    town: 'Nafplio',
    townGreek: 'Ναύπλιο',
    saint: 'Saint Anastasios the Neomartyr',
    saintGreek: 'Άγιος Αναστάσιος ο Νεομάρτυς',
    date: '02-01'
  },
  {
    town: 'Nafpaktos',
    townGreek: 'Ναύπακτος',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Naxos',
    townGreek: 'Νάξος',
    saint: 'Saint Nikodemos',
    saintGreek: 'Άγιος Νικόδημος',
    date: '07-14'
  },
  {
    town: 'Nea Filadelfia Attikis',
    townGreek: 'Νέα Φιλαδέλφεια Αττικής',
    saint: 'Panagia Vourliotissa',
    saintGreek: 'Παναγία η Βουρλιώτισσα',
    date: '10-07'
    // Note: October 7 is a fixed date, not Easter-dependent
  },
  {
    town: 'Nea Ionia Attikis',
    townGreek: 'Νέα Ιωνία Αττικής',
    saint: 'Saint George Neapolites',
    saintGreek: 'Άγιος Γεώργιος ο Νεαπολίτης',
    date: '11-03'
  },
  {
    town: 'Nea Karvali',
    townGreek: 'Νέα Καρβάλη',
    saint: 'Saint Gregory the Theologian',
    saintGreek: 'Άγιος Γρηγόριος ο Θεολόγος',
    date: '01-25'
  },
  {
    town: 'Nea Kios',
    townGreek: 'Νέα Κίος',
    saint: 'Panagia Theomana',
    saintGreek: 'Παναγία Θεομάνα-Οδηγήτρια',
    date: '08-23'
  },
  {
    town: 'Nea Moudania',
    townGreek: 'Νέα Μουδανιά',
    saint: 'Panagia Koryfini',
    saintGreek: 'Παναγία Κορυφινή',
    date: '09-08'
  },
  {
    town: 'Neapoli Thessalonikis',
    townGreek: 'Νεάπολη Θεσσαλονίκης',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Nemea',
    townGreek: 'Νεμέα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Nigrita',
    townGreek: 'Νιγρίτα',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Nisyros',
    townGreek: 'Νίσυρος',
    saint: 'Saint Nikitas the Nisyrian',
    saintGreek: 'Άγιος Νικήτας ο Νισύριος',
    date: '06-21'
  },
  // === Ξ ===
  {
    town: 'Xanthi',
    townGreek: 'Ξάνθη',
    saint: 'Saint Barbara',
    saintGreek: 'Αγία Βαρβάρα',
    date: '12-04'
  },
  // === Π ===
  {
    town: 'Paiania',
    townGreek: 'Παιανία',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '05-02'
  },
  {
    town: 'Paramythia',
    townGreek: 'Παραμυθιά',
    saint: 'Saint Donatos',
    saintGreek: 'Άγιος Δονάτος',
    date: '04-30'
  },
  {
    town: 'Paros',
    townGreek: 'Πάρος',
    saint: 'Saint Arsenios of Paros',
    saintGreek: 'Άγιος Αρσένιος εν Πάρω',
    date: '05-08'
  },
  {
    town: 'Patras',
    townGreek: 'Πάτρα',
    saint: 'Saint Andrew',
    saintGreek: 'Άγιος Ανδρέας',
    date: '11-30'
  },
  {
    town: 'Peristeri Attikis',
    townGreek: 'Περιστέρι Αττικής',
    saint: 'Saint Anthony',
    saintGreek: 'Άγιος Αντώνιος',
    date: '01-17'
  },
  {
    town: 'Petroupoli Attikis',
    townGreek: 'Πετρούπολη Αττικής',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Piraeus',
    townGreek: 'Πειραιάς',
    saint: 'Saint Spyridon',
    saintGreek: 'Άγιος Σπυρίδων',
    date: '12-12'
  },
  {
    town: 'Platy Imathias',
    townGreek: 'Πλατύ Ημαθίας',
    saint: 'Saint Arsenios of Cappadocia',
    saintGreek: 'Άγιος Αρσένιος ο Καππαδόκης',
    date: '11-10'
  },
  {
    town: 'Polygyros',
    townGreek: 'Πολύγυρος',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Poros',
    townGreek: 'Πόρος',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Preveza',
    townGreek: 'Πρέβεζα',
    saint: 'Saint Charalambos',
    saintGreek: 'Άγιος Χαράλαμπος',
    date: '02-10'
  },
  {
    town: 'Pyrgos Ilias',
    townGreek: 'Πύργος Ηλείας',
    saint: 'Saint Charalambos',
    saintGreek: 'Άγιος Χαράλαμπος',
    date: '02-10'
  },
  {
    town: 'Pyli Trikalon',
    townGreek: 'Πύλη Τρικάλων',
    saint: 'Saint Bessarion',
    saintGreek: 'Άγιος Βησσαρίων',
    date: '09-15'
  },
  // === Ρ ===
  {
    town: 'Rethymno',
    townGreek: 'Ρέθυμνο',
    saint: 'Four Martyrs of Rethymno',
    saintGreek: 'Τέσσερεις Μάρτυρες Ρεθύμνου',
    date: '01-28'
  },
  {
    town: 'Rhodes',
    townGreek: 'Ρόδος',
    saint: 'Annunciation of the Virgin Mary',
    saintGreek: 'Ευαγγελισμός της Θεοτόκου',
    date: '03-25'
  },
  {
    town: 'Rhodes Old Town',
    townGreek: 'Παλιά Πόλη Ρόδου',
    saint: 'Saint Fanourios',
    saintGreek: 'Άγιος Φανούριος',
    date: '08-27'
  },
  // === Σ ===
  {
    town: 'Salamina',
    townGreek: 'Σαλαμίνα',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Samos',
    townGreek: 'Σάμος',
    saint: 'Transfiguration of Christ',
    saintGreek: 'Μεταμόρφωση του Σωτήρος',
    date: '08-06'
  },
  {
    town: 'Santorini (Thira)',
    townGreek: 'Σαντορίνη',
    saint: 'Hypapante (Presentation of Christ)',
    saintGreek: 'Υπαπαντή του Κυρίου',
    date: '02-02'
  },
  {
    town: 'Serifos',
    townGreek: 'Σέριφος',
    saint: 'Archangels Michael and Gabriel',
    saintGreek: 'Αρχάγγελοι Μιχαήλ και Γαβριήλ',
    date: '11-08'
  },
  {
    town: 'Serres',
    townGreek: 'Σέρρες',
    saint: 'Archangels Michael and Gabriel',
    saintGreek: 'Αρχάγγελοι Μιχαήλ και Γαβριήλ',
    date: '11-08'
  },
  {
    town: 'Siatista',
    townGreek: 'Σιάτιστα',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  {
    town: 'Sidirokastro',
    townGreek: 'Σιδηρόκαστρο',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Sikinos',
    townGreek: 'Σίκινος',
    saint: 'Panagia Pantanassa',
    saintGreek: 'Παναγία Παντάνασσα',
    date: '03-14',
    isMovable: true,
    easterOffset: -42 // Sunday of Orthodoxy (1st Sunday of Lent)
  },
  {
    town: 'Sifnos',
    townGreek: 'Σίφνος',
    saint: 'Panagia Chrysopigi',
    saintGreek: 'Παναγία Χρυσοπηγή',
    date: '05-30',
    isMovable: true,
    easterOffset: 39 // Ascension Thursday
  },
  {
    town: 'Sitia',
    townGreek: 'Σητεία',
    saint: 'Saint Catherine',
    saintGreek: 'Αγία Αικατερίνη',
    date: '11-25'
  },
  {
    town: 'Skiathos',
    townGreek: 'Σκιάθος',
    saint: 'Three Hierarchs',
    saintGreek: 'Τριών Ιεραρχών',
    date: '01-30'
  },
  {
    town: 'Skopelos',
    townGreek: 'Σκόπελος',
    saint: 'Saint Riginos',
    saintGreek: 'Άγιος Ρηγίνος',
    date: '02-25'
  },
  {
    town: 'Soufli',
    townGreek: 'Σουφλί',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Sparta',
    townGreek: 'Σπάρτη',
    saint: 'Saint Nikon',
    saintGreek: 'Άγιος Νίκων',
    date: '11-26'
  },
  {
    town: 'Spetses',
    townGreek: 'Σπέτσες',
    saint: 'Panagia Armata',
    saintGreek: 'Παναγία Αρμάτα',
    date: '09-08'
  },
  {
    town: 'Stylida',
    townGreek: 'Στυλίδα',
    saint: 'Saint Athanasios',
    saintGreek: 'Άγιος Αθανάσιος',
    date: '01-18'
  },
  {
    town: 'Syros',
    townGreek: 'Σύρος',
    saint: 'Assumption of Mary',
    saintGreek: 'Κοίμηση της Θεοτόκου',
    date: '08-15'
  },
  // === Τ ===
  {
    town: 'Tinos',
    townGreek: 'Τήνος',
    saint: 'Panagia Evangelistria',
    saintGreek: 'Παναγία Ευαγγελίστρια',
    date: '08-15'
  },
  {
    town: 'Trikala',
    townGreek: 'Τρίκαλα',
    saint: 'Saint Bessarion',
    saintGreek: 'Άγιος Βησσαρίων',
    date: '09-15'
  },
  {
    town: 'Tripoli',
    townGreek: 'Τρίπολη',
    saint: 'Saints Demetrios and Pavlos Neomartyr',
    saintGreek: 'Νεομάρτυρες Δημήτριος και Παύλος',
    date: '05-22'
  },
  {
    town: 'Tropaia Arkadias',
    townGreek: 'Τρόπαια Αρκαδίας',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Tyrnavos',
    townGreek: 'Τύρναβος',
    saint: 'Saint Gedeon the Neomartyr',
    saintGreek: 'Άγιος Νεομάρτυς Γεδεών',
    date: '12-30'
  },
  // === Υ ===
  {
    town: 'Hydra',
    townGreek: 'Ύδρα',
    saint: 'Assumption of Mary',
    saintGreek: 'Κοίμηση της Θεοτόκου',
    date: '08-15'
  },
  // === Φ ===
  {
    town: 'Filiatra',
    townGreek: 'Φιλιατρά',
    saint: 'Saint Charalambos',
    saintGreek: 'Άγιος Χαράλαμπος',
    date: '02-10'
  },
  {
    town: 'Filippiada',
    townGreek: 'Φιλιππιάδα',
    saint: 'Saint Bessarion',
    saintGreek: 'Άγιος Βησσαρίων',
    date: '09-15'
  },
  {
    town: 'Florina',
    townGreek: 'Φλώρινα',
    saint: 'Saint Panteleimon',
    saintGreek: 'Άγιος Παντελεήμων',
    date: '07-27'
  },
  // === Χ ===
  {
    town: 'Chalastra',
    townGreek: 'Χαλάστρα',
    saint: 'Saints Athanasios & Ioannis Kouliakiotes',
    saintGreek: 'Άγιοι Αθανάσιος και Ιωάννης οι Κουλακιώτες',
    date: '09-07'
  },
  {
    town: 'Chalcis (Chalkida)',
    townGreek: 'Χαλκίδα',
    saint: 'Saint Paraskevi',
    saintGreek: 'Αγία Παρασκευή',
    date: '07-26'
  },
  {
    town: 'Chania',
    townGreek: 'Χανιά',
    saint: 'Presentation of the Virgin Mary',
    saintGreek: 'Εισόδια της Θεοτόκου',
    date: '11-21'
  },
  {
    town: 'Chios',
    townGreek: 'Χίος',
    saint: 'Saint Isidore',
    saintGreek: 'Άγιος Ισίδωρος',
    date: '05-14'
  },
  {
    town: 'Chora Messinias',
    townGreek: 'Χώρα Μεσσηνίας',
    saint: 'Saint Demetrios Choraites Neomartyr',
    saintGreek: 'Νεομάρτυς Δημήτριος ο Χωραΐτης',
    date: '04-14'
  },
  {
    town: 'Chrysoupoli Kavalas',
    townGreek: 'Χρυσούπολη Καβάλας',
    saint: 'Saint Demetrios',
    saintGreek: 'Άγιος Δημήτριος',
    date: '10-26'
  },
  // === Additional Islands ===
  {
    town: 'Corinth',
    townGreek: 'Κόρινθος',
    saint: 'Saint Paul',
    saintGreek: 'Άγιος Παύλος',
    date: '06-29'
  },
  {
    town: 'Agrinio',
    townGreek: 'Αγρίνιο',
    saint: 'Saint Christopher',
    saintGreek: 'Άγιος Χριστόφορος',
    date: '05-09'
  },
  {
    town: 'Kilkis',
    townGreek: 'Κιλκίς',
    saint: 'Saint George',
    saintGreek: 'Άγιος Γεώργιος',
    date: '04-23'
  },
  {
    town: 'Amfissa',
    townGreek: 'Άμφισσα',
    saint: 'Saint Nicholas',
    saintGreek: 'Άγιος Νικόλαος',
    date: '12-06'
  },
  {
    town: 'Megara',
    townGreek: 'Μέγαρα',
    saint: 'Saint Lawrence',
    saintGreek: 'Άγιος Λαυρέντιος',
    date: '08-10'
  }
]

/**
 * Remove Greek accents (diacritics) from text for fuzzy matching
 * e.g., "Ηράκλειο" → "ηρακλειο"
 */
function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

/**
 * Search for a town and return matching patron saints
 * Supports accent-insensitive search (e.g., "Ηρακλειο" matches "Ηράκλειο")
 */
export function searchTown(query: string): PatronSaint[] {
  const normalizedQuery = removeAccents(query.trim())
  if (normalizedQuery.length < 2) return []

  return patronSaints.filter(ps =>
    ps.town.toLowerCase().includes(normalizedQuery) ||
    removeAccents(ps.townGreek).includes(normalizedQuery)
  ).slice(0, 10) // Limit results for dropdown
}

/**
 * Get patron saint by exact town name
 */
export function getPatronSaintByTown(town: string): PatronSaint | undefined {
  const normalized = town.toLowerCase().trim()
  return patronSaints.find(ps =>
    ps.town.toLowerCase() === normalized ||
    ps.townGreek.toLowerCase() === normalized
  )
}

/**
 * Get all towns as a simple list for autocomplete
 */
export function getAllTowns(): string[] {
  return patronSaints.map(ps => ps.town).sort()
}

/**
 * Get towns by patron saint name
 */
export function getTownsBySaint(saintName: string): PatronSaint[] {
  const normalized = saintName.toLowerCase().trim()
  return patronSaints.filter(ps =>
    ps.saint.toLowerCase().includes(normalized) ||
    ps.saintGreek.toLowerCase().includes(normalized)
  )
}
