import { describe, it, expect } from 'vitest'
import {
  patronSaints,
  searchTown,
  getPatronSaintByTown,
  getAllTowns,
  getTownsBySaint
} from './patronSaints'

describe('patronSaints data', () => {
  it('should have a large database of patron saints', () => {
    expect(patronSaints.length).toBeGreaterThan(100)
  })

  it('should have valid structure for all entries', () => {
    patronSaints.forEach(ps => {
      expect(ps.town).toBeDefined()
      expect(ps.town.length).toBeGreaterThan(0)
      expect(ps.townGreek).toBeDefined()
      expect(ps.townGreek.length).toBeGreaterThan(0)
      expect(ps.saint).toBeDefined()
      expect(ps.saint.length).toBeGreaterThan(0)
      expect(ps.saintGreek).toBeDefined()
      expect(ps.saintGreek.length).toBeGreaterThan(0)
      expect(ps.date).toMatch(/^\d{2}-\d{2}$/) // MM-DD format
    })
  })

  it('should have valid dates (month 01-12, day 01-31)', () => {
    patronSaints.forEach(ps => {
      const [month, day] = ps.date.split('-').map(Number)
      expect(month).toBeGreaterThanOrEqual(1)
      expect(month).toBeLessThanOrEqual(12)
      expect(day).toBeGreaterThanOrEqual(1)
      expect(day).toBeLessThanOrEqual(31)
    })
  })

  it('should include major Greek cities', () => {
    const majorCities = ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Piraeus']

    majorCities.forEach(city => {
      const found = patronSaints.some(ps => ps.town === city)
      expect(found).toBe(true)
    })
  })

  it('should have Athens with correct patron saint', () => {
    const athens = patronSaints.find(ps => ps.town === 'Athens')

    expect(athens).toBeDefined()
    expect(athens?.saint).toBe('Saint Dionysios the Areopagite')
    expect(athens?.townGreek).toBe('Αθήνα')
    expect(athens?.date).toBe('10-03')
  })

  it('should have Thessaloniki with Saint Demetrios', () => {
    const thessaloniki = patronSaints.find(ps => ps.town === 'Thessaloniki')

    expect(thessaloniki).toBeDefined()
    expect(thessaloniki?.saint).toBe('Saint Demetrios')
    expect(thessaloniki?.townGreek).toBe('Θεσσαλονίκη')
    expect(thessaloniki?.date).toBe('10-26')
  })

  it('should mark movable feast days correctly', () => {
    const movableEntries = patronSaints.filter(ps => ps.isMovable === true)

    expect(movableEntries.length).toBeGreaterThan(0)

    // Check that Andros has movable date
    const andros = patronSaints.find(ps => ps.town === 'Andros')
    expect(andros?.isMovable).toBe(true)
  })

  it('should have easterOffset for movable feasts', () => {
    const movableEntries = patronSaints.filter(ps => ps.isMovable === true)

    // All movable feasts should have easterOffset defined
    movableEntries.forEach(ps => {
      expect(ps.easterOffset).toBeDefined()
      expect(typeof ps.easterOffset).toBe('number')
    })
  })

  it('should have Aigio with correct movable feast data', () => {
    const aigio = patronSaints.find(ps => ps.town === 'Aigio')

    expect(aigio).toBeDefined()
    expect(aigio?.townGreek).toBe('Αίγιο')
    expect(aigio?.saintGreek).toBe('Παναγία Τρυπητή')
    expect(aigio?.isMovable).toBe(true)
    expect(aigio?.easterOffset).toBe(5) // Bright Friday (Easter + 5)
  })

  it('should have correct Easter offsets for known movable feasts', () => {
    // Ζωοδόχος Πηγή (Life-giving Spring) - Bright Friday = Easter + 5
    const agiaParaskevi = patronSaints.find(
      ps => ps.town === 'Agia Paraskevi Thessalonikis'
    )
    expect(agiaParaskevi?.easterOffset).toBe(5)

    // Αγία Τριάδα (Holy Trinity) - Pentecost = Easter + 49
    const milos = patronSaints.find(ps => ps.town === 'Milos')
    expect(milos?.easterOffset).toBe(49)

    // Παναγία Χρυσοπηγή - Ascension = Easter + 39
    const sifnos = patronSaints.find(ps => ps.town === 'Sifnos')
    expect(sifnos?.easterOffset).toBe(39)
  })
})

describe('searchTown', () => {
  it('should find towns by English name', () => {
    const results = searchTown('Athens')

    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.town === 'Athens')).toBe(true)
  })

  it('should find towns by Greek name', () => {
    const results = searchTown('Αθήνα')

    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.townGreek === 'Αθήνα')).toBe(true)
  })

  it('should be case insensitive', () => {
    const resultsLower = searchTown('athens')
    const resultsUpper = searchTown('ATHENS')
    const resultsMixed = searchTown('AtHeNs')

    expect(resultsLower.length).toBeGreaterThan(0)
    expect(resultsUpper.length).toEqual(resultsLower.length)
    expect(resultsMixed.length).toEqual(resultsLower.length)
  })

  it('should find partial matches', () => {
    const results = searchTown('Thess')

    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.town === 'Thessaloniki')).toBe(true)
  })

  it('should return empty array for short queries (< 2 chars)', () => {
    expect(searchTown('A')).toHaveLength(0)
    expect(searchTown('')).toHaveLength(0)
  })

  it('should limit results to 10', () => {
    // Search for a common prefix that might match many towns
    const results = searchTown('Ag')

    expect(results.length).toBeLessThanOrEqual(10)
  })

  it('should trim whitespace from query', () => {
    const results = searchTown('  Athens  ')

    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.town === 'Athens')).toBe(true)
  })

  it('should return empty array for non-matching query', () => {
    const results = searchTown('NonExistentTown12345')

    expect(results).toHaveLength(0)
  })

  it('should ignore Greek accents in search (accent-insensitive)', () => {
    // Search without accent should find town with accent
    const resultsNoAccent = searchTown('Ηρακλειο')
    const resultsWithAccent = searchTown('Ηράκλειο')

    expect(resultsNoAccent.length).toBeGreaterThan(0)
    expect(resultsNoAccent.some(r => r.townGreek === 'Ηράκλειο')).toBe(true)
    expect(resultsNoAccent.length).toEqual(resultsWithAccent.length)
  })

  it('should match regardless of accent placement', () => {
    // Test various accent combinations
    const results1 = searchTown('Αθηνα')  // no accent
    const results2 = searchTown('Αθήνα')  // with accent

    expect(results1.length).toBeGreaterThan(0)
    expect(results1.some(r => r.townGreek === 'Αθήνα')).toBe(true)
    expect(results1.length).toEqual(results2.length)
  })
})

describe('getPatronSaintByTown', () => {
  it('should find patron saint by exact English name', () => {
    const result = getPatronSaintByTown('Athens')

    expect(result).toBeDefined()
    expect(result?.town).toBe('Athens')
    expect(result?.saint).toBe('Saint Dionysios the Areopagite')
  })

  it('should find patron saint by exact Greek name', () => {
    const result = getPatronSaintByTown('Αθήνα')

    expect(result).toBeDefined()
    expect(result?.townGreek).toBe('Αθήνα')
  })

  it('should be case insensitive', () => {
    const result1 = getPatronSaintByTown('athens')
    const result2 = getPatronSaintByTown('ATHENS')

    expect(result1).toBeDefined()
    expect(result2).toBeDefined()
    expect(result1?.town).toBe(result2?.town)
  })

  it('should trim whitespace', () => {
    const result = getPatronSaintByTown('  Athens  ')

    expect(result).toBeDefined()
    expect(result?.town).toBe('Athens')
  })

  it('should return undefined for non-existent town', () => {
    const result = getPatronSaintByTown('NonExistentTown')

    expect(result).toBeUndefined()
  })

  it('should return undefined for partial matches', () => {
    const result = getPatronSaintByTown('Athe')

    expect(result).toBeUndefined()
  })
})

describe('getAllTowns', () => {
  it('should return all town names', () => {
    const towns = getAllTowns()

    expect(towns.length).toBe(patronSaints.length)
  })

  it('should return sorted list', () => {
    const towns = getAllTowns()

    const sorted = [...towns].sort()
    expect(towns).toEqual(sorted)
  })

  it('should contain major cities', () => {
    const towns = getAllTowns()

    expect(towns).toContain('Athens')
    expect(towns).toContain('Thessaloniki')
    expect(towns).toContain('Patras')
  })

  it('should return English names only', () => {
    const towns = getAllTowns()

    // Should not contain Greek characters in any town name
    towns.forEach(town => {
      // English names shouldn't have Greek letters
      expect(town).not.toMatch(/[α-ωά-ώ]/i)
    })
  })
})

describe('getTownsBySaint', () => {
  it('should find all towns with Saint Nicholas', () => {
    const results = getTownsBySaint('Saint Nicholas')

    expect(results.length).toBeGreaterThan(0)

    // Multiple towns have Saint Nicholas as patron
    const towns = results.map(r => r.town)
    expect(towns).toContain('Volos')
    expect(towns).toContain('Alexandroupoli')
    expect(towns).toContain('Kavala')
  })

  it('should find towns by Greek saint name', () => {
    const results = getTownsBySaint('Άγιος Νικόλαος')

    expect(results.length).toBeGreaterThan(0)
  })

  it('should be case insensitive', () => {
    const results1 = getTownsBySaint('saint nicholas')
    const results2 = getTownsBySaint('SAINT NICHOLAS')

    expect(results1.length).toBe(results2.length)
  })

  it('should find partial matches', () => {
    const results = getTownsBySaint('Nicholas')

    expect(results.length).toBeGreaterThan(0)
  })

  it('should return empty array for non-matching saint', () => {
    const results = getTownsBySaint('NonExistentSaint12345')

    expect(results).toHaveLength(0)
  })

  it('should find multiple towns with Saint Demetrios', () => {
    const results = getTownsBySaint('Saint Demetrios')

    expect(results.length).toBeGreaterThan(5)

    const towns = results.map(r => r.town)
    expect(towns).toContain('Thessaloniki')
  })

  it('should find towns with Saint George', () => {
    const results = getTownsBySaint('Saint George')

    // Saint George is very common
    expect(results.length).toBeGreaterThan(10)
  })
})

describe('data integrity', () => {
  it('should have unique town entries', () => {
    const towns = patronSaints.map(ps => ps.town.toLowerCase())
    const uniqueTowns = new Set(towns)

    // Note: There might be intentional duplicates (e.g., different neighborhoods)
    // but the count should be close
    expect(uniqueTowns.size).toBeGreaterThan(patronSaints.length * 0.9)
  })

  it('should have consistent date format', () => {
    patronSaints.forEach(ps => {
      expect(ps.date).toMatch(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)
    })
  })

  it('should have non-empty Greek translations', () => {
    patronSaints.forEach(ps => {
      expect(ps.townGreek.trim().length).toBeGreaterThan(0)
      expect(ps.saintGreek.trim().length).toBeGreaterThan(0)
    })
  })

  it('should have valid February dates', () => {
    const februaryEntries = patronSaints.filter(ps => ps.date.startsWith('02-'))

    februaryEntries.forEach(ps => {
      const day = parseInt(ps.date.split('-')[1]!)
      expect(day).toBeLessThanOrEqual(29) // Max Feb days (leap year)
    })
  })

  it('should have valid April, June, September, November dates (30 days)', () => {
    const thirtyDayMonths = ['04', '06', '09', '11']
    const entries = patronSaints.filter(ps =>
      thirtyDayMonths.includes(ps.date.split('-')[0]!)
    )

    entries.forEach(ps => {
      const day = parseInt(ps.date.split('-')[1]!)
      expect(day).toBeLessThanOrEqual(30)
    })
  })
})
