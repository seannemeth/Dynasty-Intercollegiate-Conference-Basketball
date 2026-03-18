// All 362 NCAA Division I Basketball Programs
// Prestige: 1-5 (5 = Blue Blood / Elite Program)
// Colors are approximate primary/secondary

export interface D1School {
  name: string;
  short_name: string;
  abbreviation: string;
  conference: string;
  prestige: 1 | 2 | 3 | 4 | 5;
  color_primary: string;
  color_secondary: string;
  city: string;
  state: string;
  arena_name: string;
  arena_capacity: number;
}

export const D1_SCHOOLS: D1School[] = [
  // ────────────────────────────────────────────
  // SEC (16)
  // ────────────────────────────────────────────
  { name: "University of Alabama", short_name: "Alabama", abbreviation: "ALA", conference: "SEC", prestige: 3, color_primary: "#9E1B32", color_secondary: "#FFFFFF", city: "Tuscaloosa", state: "AL", arena_name: "Coleman Coliseum", arena_capacity: 15383 },
  { name: "University of Arkansas", short_name: "Arkansas", abbreviation: "ARK", conference: "SEC", prestige: 3, color_primary: "#9D2235", color_secondary: "#FFFFFF", city: "Fayetteville", state: "AR", arena_name: "Bud Walton Arena", arena_capacity: 19200 },
  { name: "Auburn University", short_name: "Auburn", abbreviation: "AUB", conference: "SEC", prestige: 3, color_primary: "#0C2340", color_secondary: "#F26522", city: "Auburn", state: "AL", arena_name: "Neville Arena", arena_capacity: 9121 },
  { name: "University of Florida", short_name: "Florida", abbreviation: "FLA", conference: "SEC", prestige: 4, color_primary: "#003087", color_secondary: "#FA4616", city: "Gainesville", state: "FL", arena_name: "Exactech Arena", arena_capacity: 12000 },
  { name: "University of Georgia", short_name: "Georgia", abbreviation: "UGA", conference: "SEC", prestige: 2, color_primary: "#BA0C2F", color_secondary: "#000000", city: "Athens", state: "GA", arena_name: "Stegeman Coliseum", arena_capacity: 10523 },
  { name: "University of Kentucky", short_name: "Kentucky", abbreviation: "UK", conference: "SEC", prestige: 5, color_primary: "#005DAA", color_secondary: "#FFFFFF", city: "Lexington", state: "KY", arena_name: "Rupp Arena", arena_capacity: 20545 },
  { name: "Louisiana State University", short_name: "LSU", abbreviation: "LSU", conference: "SEC", prestige: 3, color_primary: "#461D7C", color_secondary: "#FDD023", city: "Baton Rouge", state: "LA", arena_name: "Pete Maravich Assembly Center", arena_capacity: 13472 },
  { name: "Mississippi State University", short_name: "Mississippi St", abbreviation: "MSST", conference: "SEC", prestige: 2, color_primary: "#660000", color_secondary: "#FFFFFF", city: "Starkville", state: "MS", arena_name: "Humphrey Coliseum", arena_capacity: 10575 },
  { name: "University of Missouri", short_name: "Missouri", abbreviation: "MIZ", conference: "SEC", prestige: 2, color_primary: "#F1B82D", color_secondary: "#000000", city: "Columbia", state: "MO", arena_name: "Mizzou Arena", arena_capacity: 15061 },
  { name: "University of Mississippi", short_name: "Ole Miss", abbreviation: "MISS", conference: "SEC", prestige: 2, color_primary: "#CE1126", color_secondary: "#14213D", city: "Oxford", state: "MS", arena_name: "The Sandy and John Black Pavilion", arena_capacity: 9501 },
  { name: "University of Oklahoma", short_name: "Oklahoma", abbreviation: "OU", conference: "SEC", prestige: 3, color_primary: "#841617", color_secondary: "#FDF9D8", city: "Norman", state: "OK", arena_name: "Lloyd Noble Center", arena_capacity: 11212 },
  { name: "University of South Carolina", short_name: "South Carolina", abbreviation: "SC", conference: "SEC", prestige: 2, color_primary: "#73000A", color_secondary: "#000000", city: "Columbia", state: "SC", arena_name: "Colonial Life Arena", arena_capacity: 18000 },
  { name: "University of Tennessee", short_name: "Tennessee", abbreviation: "TENN", conference: "SEC", prestige: 4, color_primary: "#FF8200", color_secondary: "#FFFFFF", city: "Knoxville", state: "TN", arena_name: "Thompson-Boling Arena", arena_capacity: 21678 },
  { name: "University of Texas", short_name: "Texas", abbreviation: "TEX", conference: "SEC", prestige: 4, color_primary: "#BF5700", color_secondary: "#FFFFFF", city: "Austin", state: "TX", arena_name: "Moody Center", arena_capacity: 15000 },
  { name: "Texas A&M University", short_name: "Texas A&M", abbreviation: "TAMU", conference: "SEC", prestige: 3, color_primary: "#500000", color_secondary: "#FFFFFF", city: "College Station", state: "TX", arena_name: "Reed Arena", arena_capacity: 12989 },
  { name: "Vanderbilt University", short_name: "Vanderbilt", abbreviation: "VANDY", conference: "SEC", prestige: 2, color_primary: "#000000", color_secondary: "#CFAE70", city: "Nashville", state: "TN", arena_name: "Memorial Gymnasium", arena_capacity: 14316 },

  // ────────────────────────────────────────────
  // ACC (18)
  // ────────────────────────────────────────────
  { name: "Boston College", short_name: "Boston College", abbreviation: "BC", conference: "ACC", prestige: 2, color_primary: "#98002E", color_secondary: "#C9A84C", city: "Chestnut Hill", state: "MA", arena_name: "Conte Forum", arena_capacity: 8606 },
  { name: "University of California", short_name: "California", abbreviation: "CAL", conference: "ACC", prestige: 2, color_primary: "#003262", color_secondary: "#FDB515", city: "Berkeley", state: "CA", arena_name: "Haas Pavilion", arena_capacity: 11877 },
  { name: "Clemson University", short_name: "Clemson", abbreviation: "CLEM", conference: "ACC", prestige: 2, color_primary: "#F56600", color_secondary: "#522D80", city: "Clemson", state: "SC", arena_name: "Littlejohn Coliseum", arena_capacity: 9000 },
  { name: "Duke University", short_name: "Duke", abbreviation: "DUKE", conference: "ACC", prestige: 5, color_primary: "#012169", color_secondary: "#FFFFFF", city: "Durham", state: "NC", arena_name: "Cameron Indoor Stadium", arena_capacity: 9314 },
  { name: "Florida State University", short_name: "Florida State", abbreviation: "FSU", conference: "ACC", prestige: 3, color_primary: "#782F40", color_secondary: "#CEB888", city: "Tallahassee", state: "FL", arena_name: "Donald L. Tucker Civic Center", arena_capacity: 12500 },
  { name: "Georgia Tech", short_name: "Georgia Tech", abbreviation: "GT", conference: "ACC", prestige: 2, color_primary: "#B3A369", color_secondary: "#FFFFFF", city: "Atlanta", state: "GA", arena_name: "McCamish Pavilion", arena_capacity: 8600 },
  { name: "University of Louisville", short_name: "Louisville", abbreviation: "LOU", conference: "ACC", prestige: 4, color_primary: "#AD0000", color_secondary: "#000000", city: "Louisville", state: "KY", arena_name: "KFC Yum! Center", arena_capacity: 22090 },
  { name: "University of Miami", short_name: "Miami", abbreviation: "MIA", conference: "ACC", prestige: 3, color_primary: "#005030", color_secondary: "#F47321", city: "Coral Gables", state: "FL", arena_name: "Watsco Center", arena_capacity: 7972 },
  { name: "NC State University", short_name: "NC State", abbreviation: "NCST", conference: "ACC", prestige: 3, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Raleigh", state: "NC", arena_name: "PNC Arena", arena_capacity: 19722 },
  { name: "University of North Carolina", short_name: "UNC", abbreviation: "UNC", conference: "ACC", prestige: 5, color_primary: "#56A0D3", color_secondary: "#FFFFFF", city: "Chapel Hill", state: "NC", arena_name: "Dean Smith Center", arena_capacity: 21750 },
  { name: "University of Notre Dame", short_name: "Notre Dame", abbreviation: "ND", conference: "ACC", prestige: 3, color_primary: "#0C2340", color_secondary: "#C99700", city: "Notre Dame", state: "IN", arena_name: "Purcell Pavilion", arena_capacity: 9149 },
  { name: "University of Pittsburgh", short_name: "Pittsburgh", abbreviation: "PITT", conference: "ACC", prestige: 3, color_primary: "#003594", color_secondary: "#FFB81C", city: "Pittsburgh", state: "PA", arena_name: "Petersen Events Center", arena_capacity: 12508 },
  { name: "SMU", short_name: "SMU", abbreviation: "SMU", conference: "ACC", prestige: 2, color_primary: "#0033A0", color_secondary: "#C8102E", city: "Dallas", state: "TX", arena_name: "Moody Coliseum", arena_capacity: 8998 },
  { name: "Stanford University", short_name: "Stanford", abbreviation: "STAN", conference: "ACC", prestige: 3, color_primary: "#8C1515", color_secondary: "#FFFFFF", city: "Stanford", state: "CA", arena_name: "Maples Pavilion", arena_capacity: 7391 },
  { name: "Syracuse University", short_name: "Syracuse", abbreviation: "SYR", conference: "ACC", prestige: 4, color_primary: "#D44500", color_secondary: "#FFFFFF", city: "Syracuse", state: "NY", arena_name: "JMA Wireless Dome", arena_capacity: 35012 },
  { name: "University of Virginia", short_name: "Virginia", abbreviation: "UVA", conference: "ACC", prestige: 4, color_primary: "#232D4B", color_secondary: "#F84C1E", city: "Charlottesville", state: "VA", arena_name: "John Paul Jones Arena", arena_capacity: 14593 },
  { name: "Virginia Tech", short_name: "Virginia Tech", abbreviation: "VT", conference: "ACC", prestige: 2, color_primary: "#630031", color_secondary: "#CF4420", city: "Blacksburg", state: "VA", arena_name: "Cassell Coliseum", arena_capacity: 10052 },
  { name: "Wake Forest University", short_name: "Wake Forest", abbreviation: "WF", conference: "ACC", prestige: 3, color_primary: "#000000", color_secondary: "#CFB53B", city: "Winston-Salem", state: "NC", arena_name: "Lawrence Joel Veterans Memorial Coliseum", arena_capacity: 14665 },

  // ────────────────────────────────────────────
  // Big Ten (18)
  // ────────────────────────────────────────────
  { name: "University of Illinois", short_name: "Illinois", abbreviation: "ILL", conference: "Big Ten", prestige: 3, color_primary: "#13294B", color_secondary: "#E84A27", city: "Champaign", state: "IL", arena_name: "State Farm Center", arena_capacity: 15544 },
  { name: "Indiana University", short_name: "Indiana", abbreviation: "IU", conference: "Big Ten", prestige: 4, color_primary: "#990000", color_secondary: "#FFFFFF", city: "Bloomington", state: "IN", arena_name: "Simon Skjodt Assembly Hall", arena_capacity: 17222 },
  { name: "University of Iowa", short_name: "Iowa", abbreviation: "IOWA", conference: "Big Ten", prestige: 3, color_primary: "#000000", color_secondary: "#FFCD00", city: "Iowa City", state: "IA", arena_name: "Carver-Hawkeye Arena", arena_capacity: 15400 },
  { name: "University of Maryland", short_name: "Maryland", abbreviation: "UMD", conference: "Big Ten", prestige: 3, color_primary: "#E03A3E", color_secondary: "#FFD520", city: "College Park", state: "MD", arena_name: "XFINITY Center", arena_capacity: 17950 },
  { name: "University of Michigan", short_name: "Michigan", abbreviation: "MICH", conference: "Big Ten", prestige: 4, color_primary: "#00274C", color_secondary: "#FFCB05", city: "Ann Arbor", state: "MI", arena_name: "Crisler Center", arena_capacity: 12707 },
  { name: "Michigan State University", short_name: "Michigan State", abbreviation: "MSU", conference: "Big Ten", prestige: 5, color_primary: "#18453B", color_secondary: "#FFFFFF", city: "East Lansing", state: "MI", arena_name: "Breslin Center", arena_capacity: 15025 },
  { name: "University of Minnesota", short_name: "Minnesota", abbreviation: "MINN", conference: "Big Ten", prestige: 2, color_primary: "#7A0019", color_secondary: "#FFCC33", city: "Minneapolis", state: "MN", arena_name: "Williams Arena", arena_capacity: 14625 },
  { name: "University of Nebraska", short_name: "Nebraska", abbreviation: "NEB", conference: "Big Ten", prestige: 2, color_primary: "#E41C38", color_secondary: "#FFFFFF", city: "Lincoln", state: "NE", arena_name: "Pinnacle Bank Arena", arena_capacity: 15000 },
  { name: "Northwestern University", short_name: "Northwestern", abbreviation: "NW", conference: "Big Ten", prestige: 2, color_primary: "#4E2A84", color_secondary: "#FFFFFF", city: "Evanston", state: "IL", arena_name: "Welsh-Ryan Arena", arena_capacity: 8117 },
  { name: "Ohio State University", short_name: "Ohio State", abbreviation: "OSU", conference: "Big Ten", prestige: 4, color_primary: "#BB0000", color_secondary: "#666666", city: "Columbus", state: "OH", arena_name: "Value City Arena", arena_capacity: 19500 },
  { name: "University of Oregon", short_name: "Oregon", abbreviation: "ORE", conference: "Big Ten", prestige: 3, color_primary: "#154733", color_secondary: "#FEE123", city: "Eugene", state: "OR", arena_name: "Matthew Knight Arena", arena_capacity: 12364 },
  { name: "Penn State University", short_name: "Penn State", abbreviation: "PSU", conference: "Big Ten", prestige: 2, color_primary: "#041E42", color_secondary: "#FFFFFF", city: "University Park", state: "PA", arena_name: "Bryce Jordan Center", arena_capacity: 15261 },
  { name: "Purdue University", short_name: "Purdue", abbreviation: "PUR", conference: "Big Ten", prestige: 4, color_primary: "#CEB888", color_secondary: "#000000", city: "West Lafayette", state: "IN", arena_name: "Mackey Arena", arena_capacity: 14876 },
  { name: "Rutgers University", short_name: "Rutgers", abbreviation: "RU", conference: "Big Ten", prestige: 2, color_primary: "#CC0033", color_secondary: "#FFFFFF", city: "Piscataway", state: "NJ", arena_name: "Jersey Mike's Arena", arena_capacity: 8000 },
  { name: "UCLA", short_name: "UCLA", abbreviation: "UCLA", conference: "Big Ten", prestige: 5, color_primary: "#2D68C4", color_secondary: "#F2A900", city: "Los Angeles", state: "CA", arena_name: "Pauley Pavilion", arena_capacity: 13800 },
  { name: "USC", short_name: "USC", abbreviation: "USC", conference: "Big Ten", prestige: 3, color_primary: "#990000", color_secondary: "#FFC72C", city: "Los Angeles", state: "CA", arena_name: "Galen Center", arena_capacity: 10258 },
  { name: "University of Washington", short_name: "Washington", abbreviation: "WASH", conference: "Big Ten", prestige: 3, color_primary: "#4B2E83", color_secondary: "#B7A57A", city: "Seattle", state: "WA", arena_name: "Alaska Airlines Arena", arena_capacity: 10000 },
  { name: "University of Wisconsin", short_name: "Wisconsin", abbreviation: "WIS", conference: "Big Ten", prestige: 4, color_primary: "#C5050C", color_secondary: "#FFFFFF", city: "Madison", state: "WI", arena_name: "Kohl Center", arena_capacity: 17142 },

  // ────────────────────────────────────────────
  // Big 12 (16)
  // ────────────────────────────────────────────
  { name: "University of Arizona", short_name: "Arizona", abbreviation: "ARIZ", conference: "Big 12", prestige: 4, color_primary: "#003369", color_secondary: "#CC0033", city: "Tucson", state: "AZ", arena_name: "McKale Center", arena_capacity: 14545 },
  { name: "Arizona State University", short_name: "Arizona State", abbreviation: "ASU", conference: "Big 12", prestige: 3, color_primary: "#8C1D40", color_secondary: "#FFC627", city: "Tempe", state: "AZ", arena_name: "Desert Financial Arena", arena_capacity: 14198 },
  { name: "Baylor University", short_name: "Baylor", abbreviation: "BAY", conference: "Big 12", prestige: 4, color_primary: "#003015", color_secondary: "#FFBF00", city: "Waco", state: "TX", arena_name: "Foster Pavilion", arena_capacity: 10284 },
  { name: "Brigham Young University", short_name: "BYU", abbreviation: "BYU", conference: "Big 12", prestige: 3, color_primary: "#002E5D", color_secondary: "#FFFFFF", city: "Provo", state: "UT", arena_name: "Marriott Center", arena_capacity: 19000 },
  { name: "University of Cincinnati", short_name: "Cincinnati", abbreviation: "CIN", conference: "Big 12", prestige: 3, color_primary: "#E00122", color_secondary: "#000000", city: "Cincinnati", state: "OH", arena_name: "Fifth Third Arena", arena_capacity: 12012 },
  { name: "University of Colorado", short_name: "Colorado", abbreviation: "COLO", conference: "Big 12", prestige: 3, color_primary: "#CFB87C", color_secondary: "#000000", city: "Boulder", state: "CO", arena_name: "CU Events Center", arena_capacity: 11064 },
  { name: "University of Houston", short_name: "Houston", abbreviation: "HOU", conference: "Big 12", prestige: 4, color_primary: "#C8102E", color_secondary: "#FFFFFF", city: "Houston", state: "TX", arena_name: "Fertitta Center", arena_capacity: 7100 },
  { name: "Iowa State University", short_name: "Iowa State", abbreviation: "ISU", conference: "Big 12", prestige: 3, color_primary: "#C8102E", color_secondary: "#F1BE48", city: "Ames", state: "IA", arena_name: "Hilton Coliseum", arena_capacity: 14267 },
  { name: "University of Kansas", short_name: "Kansas", abbreviation: "KU", conference: "Big 12", prestige: 5, color_primary: "#0051A5", color_secondary: "#E8000D", city: "Lawrence", state: "KS", arena_name: "Allen Fieldhouse", arena_capacity: 16300 },
  { name: "Kansas State University", short_name: "Kansas State", abbreviation: "KSU", conference: "Big 12", prestige: 3, color_primary: "#512888", color_secondary: "#FFFFFF", city: "Manhattan", state: "KS", arena_name: "Bramlage Coliseum", arena_capacity: 12528 },
  { name: "Oklahoma State University", short_name: "Oklahoma State", abbreviation: "OKST", conference: "Big 12", prestige: 3, color_primary: "#FF6600", color_secondary: "#000000", city: "Stillwater", state: "OK", arena_name: "Gallagher-Iba Arena", arena_capacity: 13611 },
  { name: "TCU", short_name: "TCU", abbreviation: "TCU", conference: "Big 12", prestige: 2, color_primary: "#4D1979", color_secondary: "#A3A9AC", city: "Fort Worth", state: "TX", arena_name: "Schollmaier Arena", arena_capacity: 7200 },
  { name: "Texas Tech University", short_name: "Texas Tech", abbreviation: "TTU", conference: "Big 12", prestige: 4, color_primary: "#CC0000", color_secondary: "#000000", city: "Lubbock", state: "TX", arena_name: "United Supermarkets Arena", arena_capacity: 15098 },
  { name: "UCF", short_name: "UCF", abbreviation: "UCF", conference: "Big 12", prestige: 2, color_primary: "#000000", color_secondary: "#BA9B37", city: "Orlando", state: "FL", arena_name: "Addition Financial Arena", arena_capacity: 10000 },
  { name: "University of Utah", short_name: "Utah", abbreviation: "UTAH", conference: "Big 12", prestige: 3, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Salt Lake City", state: "UT", arena_name: "Jon M. Huntsman Center", arena_capacity: 15000 },
  { name: "West Virginia University", short_name: "West Virginia", abbreviation: "WVU", conference: "Big 12", prestige: 3, color_primary: "#002855", color_secondary: "#EAAA00", city: "Morgantown", state: "WV", arena_name: "WVU Coliseum", arena_capacity: 14000 },

  // ────────────────────────────────────────────
  // American Athletic Conference (14)
  // ────────────────────────────────────────────
  { name: "University of Alabama Birmingham", short_name: "UAB", abbreviation: "UAB", conference: "American Athletic", prestige: 2, color_primary: "#1E6B52", color_secondary: "#FFFFFF", city: "Birmingham", state: "AL", arena_name: "Bartow Arena", arena_capacity: 8508 },
  { name: "University of Charlotte", short_name: "Charlotte", abbreviation: "CHAR", conference: "American Athletic", prestige: 1, color_primary: "#006A4D", color_secondary: "#B9975B", city: "Charlotte", state: "NC", arena_name: "Dale F. Halton Arena", arena_capacity: 9105 },
  { name: "East Carolina University", short_name: "East Carolina", abbreviation: "ECU", conference: "American Athletic", prestige: 1, color_primary: "#4B1869", color_secondary: "#FDC82F", city: "Greenville", state: "NC", arena_name: "Williams Arena at Minges Coliseum", arena_capacity: 8000 },
  { name: "Florida Atlantic University", short_name: "Florida Atlantic", abbreviation: "FAU", conference: "American Athletic", prestige: 2, color_primary: "#003366", color_secondary: "#CC0000", city: "Boca Raton", state: "FL", arena_name: "Eleanor R. Baldwin Arena", arena_capacity: 5000 },
  { name: "University of Memphis", short_name: "Memphis", abbreviation: "MEM", conference: "American Athletic", prestige: 4, color_primary: "#003087", color_secondary: "#898D8D", city: "Memphis", state: "TN", arena_name: "FedExForum", arena_capacity: 18119 },
  { name: "United States Naval Academy", short_name: "Navy", abbreviation: "NAVY", conference: "American Athletic", prestige: 1, color_primary: "#00205B", color_secondary: "#C5B783", city: "Annapolis", state: "MD", arena_name: "Alumni Hall", arena_capacity: 5710 },
  { name: "University of North Texas", short_name: "North Texas", abbreviation: "UNT", conference: "American Athletic", prestige: 1, color_primary: "#00853E", color_secondary: "#FFFFFF", city: "Denton", state: "TX", arena_name: "Super Pit", arena_capacity: 10100 },
  { name: "Rice University", short_name: "Rice", abbreviation: "RICE", conference: "American Athletic", prestige: 1, color_primary: "#00205B", color_secondary: "#C1A875", city: "Houston", state: "TX", arena_name: "Tudor Fieldhouse", arena_capacity: 5000 },
  { name: "University of South Florida", short_name: "South Florida", abbreviation: "USF", conference: "American Athletic", prestige: 1, color_primary: "#006747", color_secondary: "#CFC493", city: "Tampa", state: "FL", arena_name: "Yuengling Center", arena_capacity: 10411 },
  { name: "Temple University", short_name: "Temple", abbreviation: "TEM", conference: "American Athletic", prestige: 2, color_primary: "#9D2235", color_secondary: "#FFFFFF", city: "Philadelphia", state: "PA", arena_name: "Liacouras Center", arena_capacity: 10206 },
  { name: "Tulane University", short_name: "Tulane", abbreviation: "TUL", conference: "American Athletic", prestige: 2, color_primary: "#006747", color_secondary: "#418FDE", city: "New Orleans", state: "LA", arena_name: "Avron B. Fogelman Arena", arena_capacity: 5000 },
  { name: "University of Tulsa", short_name: "Tulsa", abbreviation: "TLSA", conference: "American Athletic", prestige: 2, color_primary: "#003865", color_secondary: "#C8A96E", city: "Tulsa", state: "OK", arena_name: "Reynolds Center", arena_capacity: 8355 },
  { name: "University of Texas at San Antonio", short_name: "UTSA", abbreviation: "UTSA", conference: "American Athletic", prestige: 1, color_primary: "#F15A22", color_secondary: "#002A5C", city: "San Antonio", state: "TX", arena_name: "Convocation Center", arena_capacity: 8000 },
  { name: "Wichita State University", short_name: "Wichita State", abbreviation: "WSU", conference: "American Athletic", prestige: 3, color_primary: "#000000", color_secondary: "#F5D130", city: "Wichita", state: "KS", arena_name: "Charles Koch Arena", arena_capacity: 10506 },

  // ────────────────────────────────────────────
  // Atlantic 10 (14)
  // ────────────────────────────────────────────
  { name: "Davidson College", short_name: "Davidson", abbreviation: "DAV", conference: "Atlantic 10", prestige: 2, color_primary: "#CC0000", color_secondary: "#000000", city: "Davidson", state: "NC", arena_name: "John M. Belk Arena", arena_capacity: 5700 },
  { name: "University of Dayton", short_name: "Dayton", abbreviation: "DAY", conference: "Atlantic 10", prestige: 3, color_primary: "#CC0000", color_secondary: "#003366", city: "Dayton", state: "OH", arena_name: "UD Arena", arena_capacity: 13407 },
  { name: "Duquesne University", short_name: "Duquesne", abbreviation: "DUQ", conference: "Atlantic 10", prestige: 2, color_primary: "#003087", color_secondary: "#CC0000", city: "Pittsburgh", state: "PA", arena_name: "UPMC Cooper Fieldhouse", arena_capacity: 4000 },
  { name: "Fordham University", short_name: "Fordham", abbreviation: "FOR", conference: "Atlantic 10", prestige: 1, color_primary: "#891928", color_secondary: "#FFFFFF", city: "Bronx", state: "NY", arena_name: "Rose Hill Gymnasium", arena_capacity: 3470 },
  { name: "George Mason University", short_name: "George Mason", abbreviation: "GMU", conference: "Atlantic 10", prestige: 2, color_primary: "#006633", color_secondary: "#FFD700", city: "Fairfax", state: "VA", arena_name: "Eagle Bank Arena", arena_capacity: 10000 },
  { name: "George Washington University", short_name: "George Washington", abbreviation: "GWU", conference: "Atlantic 10", prestige: 2, color_primary: "#033A5B", color_secondary: "#BBA14F", city: "Washington", state: "DC", arena_name: "Charles E. Smith Center", arena_capacity: 5000 },
  { name: "La Salle University", short_name: "La Salle", abbreviation: "LAS", conference: "Atlantic 10", prestige: 2, color_primary: "#00539B", color_secondary: "#F5C400", city: "Philadelphia", state: "PA", arena_name: "Tom Gola Arena", arena_capacity: 4000 },
  { name: "Loyola University Chicago", short_name: "Loyola Chicago", abbreviation: "LUC", conference: "Atlantic 10", prestige: 2, color_primary: "#8B2346", color_secondary: "#D2AC62", city: "Chicago", state: "IL", arena_name: "Gentile Arena", arena_capacity: 5200 },
  { name: "University of Massachusetts", short_name: "Massachusetts", abbreviation: "UMASS", conference: "Atlantic 10", prestige: 2, color_primary: "#971B2F", color_secondary: "#FFFFFF", city: "Amherst", state: "MA", arena_name: "Mullins Center", arena_capacity: 9493 },
  { name: "University of Rhode Island", short_name: "Rhode Island", abbreviation: "URI", conference: "Atlantic 10", prestige: 2, color_primary: "#002366", color_secondary: "#75B2DD", city: "Kingston", state: "RI", arena_name: "Ryan Center", arena_capacity: 7657 },
  { name: "University of Richmond", short_name: "Richmond", abbreviation: "RICH", conference: "Atlantic 10", prestige: 2, color_primary: "#003087", color_secondary: "#CC1122", city: "Richmond", state: "VA", arena_name: "Robins Center", arena_capacity: 9071 },
  { name: "Saint Joseph's University", short_name: "Saint Joseph's", abbreviation: "SJU", conference: "Atlantic 10", prestige: 2, color_primary: "#9E1B32", color_secondary: "#A4A9AD", city: "Philadelphia", state: "PA", arena_name: "Hagan Arena", arena_capacity: 4200 },
  { name: "Saint Louis University", short_name: "Saint Louis", abbreviation: "SLU", conference: "Atlantic 10", prestige: 2, color_primary: "#003DA5", color_secondary: "#BBBCBC", city: "St. Louis", state: "MO", arena_name: "Chaifetz Arena", arena_capacity: 10600 },
  { name: "Virginia Commonwealth University", short_name: "VCU", abbreviation: "VCU", conference: "Atlantic 10", prestige: 3, color_primary: "#000000", color_secondary: "#CFB87C", city: "Richmond", state: "VA", arena_name: "Stuart C. Siegel Center", arena_capacity: 7617 },

  // ────────────────────────────────────────────
  // Mountain West (12)
  // ────────────────────────────────────────────
  { name: "Air Force Academy", short_name: "Air Force", abbreviation: "AFA", conference: "Mountain West", prestige: 1, color_primary: "#003087", color_secondary: "#8A8B8C", city: "Colorado Springs", state: "CO", arena_name: "Clune Arena", arena_capacity: 6007 },
  { name: "Boise State University", short_name: "Boise State", abbreviation: "BSU", conference: "Mountain West", prestige: 2, color_primary: "#0033A0", color_secondary: "#D64309", city: "Boise", state: "ID", arena_name: "ExtraMile Arena", arena_capacity: 12380 },
  { name: "Colorado State University", short_name: "Colorado State", abbreviation: "CSU", conference: "Mountain West", prestige: 2, color_primary: "#1E4D2B", color_secondary: "#C8C372", city: "Fort Collins", state: "CO", arena_name: "Moby Arena", arena_capacity: 8745 },
  { name: "Fresno State University", short_name: "Fresno State", abbreviation: "FRES", conference: "Mountain West", prestige: 2, color_primary: "#CC0000", color_secondary: "#003A70", city: "Fresno", state: "CA", arena_name: "Save Mart Center", arena_capacity: 15596 },
  { name: "University of Hawaii", short_name: "Hawaii", abbreviation: "HAW", conference: "Mountain West", prestige: 1, color_primary: "#024694", color_secondary: "#A8996E", city: "Honolulu", state: "HI", arena_name: "SimpliFi Arena at Stan Sheriff Center", arena_capacity: 10300 },
  { name: "University of Nevada", short_name: "Nevada", abbreviation: "NEV", conference: "Mountain West", prestige: 2, color_primary: "#003366", color_secondary: "#807A6E", city: "Reno", state: "NV", arena_name: "Lawlor Events Center", arena_capacity: 11536 },
  { name: "University of New Mexico", short_name: "New Mexico", abbreviation: "UNM", conference: "Mountain West", prestige: 2, color_primary: "#BA0C2F", color_secondary: "#63666A", city: "Albuquerque", state: "NM", arena_name: "The Pit", arena_capacity: 15411 },
  { name: "San Diego State University", short_name: "San Diego State", abbreviation: "SDSU", conference: "Mountain West", prestige: 3, color_primary: "#A6192E", color_secondary: "#000000", city: "San Diego", state: "CA", arena_name: "Viejas Arena", arena_capacity: 12414 },
  { name: "San Jose State University", short_name: "San Jose State", abbreviation: "SJSU", conference: "Mountain West", prestige: 1, color_primary: "#0055A2", color_secondary: "#E5A823", city: "San Jose", state: "CA", arena_name: "Provident Credit Union Event Center", arena_capacity: 5000 },
  { name: "University of Nevada Las Vegas", short_name: "UNLV", abbreviation: "UNLV", conference: "Mountain West", prestige: 3, color_primary: "#CF0A2C", color_secondary: "#666666", city: "Las Vegas", state: "NV", arena_name: "Thomas & Mack Center", arena_capacity: 18776 },
  { name: "Utah State University", short_name: "Utah State", abbreviation: "USU", conference: "Mountain West", prestige: 2, color_primary: "#00263A", color_secondary: "#8B9DC3", city: "Logan", state: "UT", arena_name: "Dee Glen Smith Spectrum", arena_capacity: 10270 },
  { name: "University of Wyoming", short_name: "Wyoming", abbreviation: "WYO", conference: "Mountain West", prestige: 1, color_primary: "#492F24", color_secondary: "#FFC425", city: "Laramie", state: "WY", arena_name: "Arena-Auditorium", arena_capacity: 15028 },

  // ────────────────────────────────────────────
  // Missouri Valley (11)
  // ────────────────────────────────────────────
  { name: "Bradley University", short_name: "Bradley", abbreviation: "BRA", conference: "Missouri Valley", prestige: 2, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Peoria", state: "IL", arena_name: "Carver Arena", arena_capacity: 10825 },
  { name: "Drake University", short_name: "Drake", abbreviation: "DRA", conference: "Missouri Valley", prestige: 2, color_primary: "#004477", color_secondary: "#FFFFFF", city: "Des Moines", state: "IA", arena_name: "Knapp Center", arena_capacity: 7002 },
  { name: "Evansville University", short_name: "Evansville", abbreviation: "EVAN", conference: "Missouri Valley", prestige: 1, color_primary: "#6B3483", color_secondary: "#FFFFFF", city: "Evansville", state: "IN", arena_name: "Ford Center", arena_capacity: 11000 },
  { name: "Illinois State University", short_name: "Illinois State", abbreviation: "ILST", conference: "Missouri Valley", prestige: 2, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Normal", state: "IL", arena_name: "Redbird Arena", arena_capacity: 10200 },
  { name: "Indiana State University", short_name: "Indiana State", abbreviation: "INST", conference: "Missouri Valley", prestige: 2, color_primary: "#004B8D", color_secondary: "#FFFFFF", city: "Terre Haute", state: "IN", arena_name: "Hulman Center", arena_capacity: 10200 },
  { name: "Missouri State University", short_name: "Missouri State", abbreviation: "MOST", conference: "Missouri Valley", prestige: 2, color_primary: "#6E0E37", color_secondary: "#000000", city: "Springfield", state: "MO", arena_name: "Great Southern Bank Arena", arena_capacity: 11000 },
  { name: "Murray State University", short_name: "Murray State", abbreviation: "MUR", conference: "Missouri Valley", prestige: 2, color_primary: "#002147", color_secondary: "#BDBDBD", city: "Murray", state: "KY", arena_name: "CFSB Center", arena_capacity: 8600 },
  { name: "University of Northern Iowa", short_name: "Northern Iowa", abbreviation: "UNI", conference: "Missouri Valley", prestige: 2, color_primary: "#4B116F", color_secondary: "#FFD100", city: "Cedar Falls", state: "IA", arena_name: "McLeod Center", arena_capacity: 7200 },
  { name: "Southern Illinois University", short_name: "Southern Illinois", abbreviation: "SIU", conference: "Missouri Valley", prestige: 2, color_primary: "#6B2E2E", color_secondary: "#000000", city: "Carbondale", state: "IL", arena_name: "Banterra Center", arena_capacity: 9000 },
  { name: "University of Illinois Chicago", short_name: "UIC", abbreviation: "UIC", conference: "Missouri Valley", prestige: 1, color_primary: "#002147", color_secondary: "#FF552E", city: "Chicago", state: "IL", arena_name: "Credit Union 1 Arena", arena_capacity: 9500 },
  { name: "Valparaiso University", short_name: "Valparaiso", abbreviation: "VAL", conference: "Missouri Valley", prestige: 1, color_primary: "#633194", color_secondary: "#CCB132", city: "Valparaiso", state: "IN", arena_name: "Athletics Recreation Center", arena_capacity: 4500 },

  // ────────────────────────────────────────────
  // West Coast Conference (10)
  // ────────────────────────────────────────────
  { name: "Gonzaga University", short_name: "Gonzaga", abbreviation: "GONZ", conference: "West Coast", prestige: 5, color_primary: "#002469", color_secondary: "#CC0000", city: "Spokane", state: "WA", arena_name: "McCarthey Athletic Center", arena_capacity: 6000 },
  { name: "Loyola Marymount University", short_name: "LMU", abbreviation: "LMU", conference: "West Coast", prestige: 1, color_primary: "#00558B", color_secondary: "#C8102E", city: "Los Angeles", state: "CA", arena_name: "Gersten Pavilion", arena_capacity: 4156 },
  { name: "University of the Pacific", short_name: "Pacific", abbreviation: "PAC", conference: "West Coast", prestige: 1, color_primary: "#F07C00", color_secondary: "#000000", city: "Stockton", state: "CA", arena_name: "Spanos Center", arena_capacity: 6150 },
  { name: "Pepperdine University", short_name: "Pepperdine", abbreviation: "PEPP", conference: "West Coast", prestige: 2, color_primary: "#003591", color_secondary: "#FF6C0E", city: "Malibu", state: "CA", arena_name: "Firestone Fieldhouse", arena_capacity: 3200 },
  { name: "University of Portland", short_name: "Portland", abbreviation: "PORT", conference: "West Coast", prestige: 1, color_primary: "#461F5A", color_secondary: "#A4BEF3", city: "Portland", state: "OR", arena_name: "Chiles Center", arena_capacity: 4861 },
  { name: "Saint Mary's College of California", short_name: "Saint Mary's", abbreviation: "SMC", conference: "West Coast", prestige: 3, color_primary: "#013176", color_secondary: "#CC0000", city: "Moraga", state: "CA", arena_name: "University Credit Union Pavilion", arena_capacity: 3500 },
  { name: "University of San Diego", short_name: "San Diego", abbreviation: "USD", conference: "West Coast", prestige: 1, color_primary: "#002F6C", color_secondary: "#C69214", city: "San Diego", state: "CA", arena_name: "Jenny Craig Pavilion", arena_capacity: 5100 },
  { name: "University of San Francisco", short_name: "San Francisco", abbreviation: "USF", conference: "West Coast", prestige: 2, color_primary: "#00543C", color_secondary: "#BFAE85", city: "San Francisco", state: "CA", arena_name: "War Memorial Gymnasium", arena_capacity: 5300 },
  { name: "Santa Clara University", short_name: "Santa Clara", abbreviation: "SCU", conference: "West Coast", prestige: 2, color_primary: "#862633", color_secondary: "#9A8249", city: "Santa Clara", state: "CA", arena_name: "Leavey Center", arena_capacity: 4700 },
  { name: "Seattle University", short_name: "Seattle", abbreviation: "SEA", conference: "West Coast", prestige: 1, color_primary: "#AA0000", color_secondary: "#FFFFFF", city: "Seattle", state: "WA", arena_name: "Redhawk Center", arena_capacity: 2500 },

  // ────────────────────────────────────────────
  // MAC (12)
  // ────────────────────────────────────────────
  { name: "University of Akron", short_name: "Akron", abbreviation: "AKR", conference: "MAC", prestige: 2, color_primary: "#002147", color_secondary: "#A89968", city: "Akron", state: "OH", arena_name: "Rhodes Arena", arena_capacity: 5500 },
  { name: "Ball State University", short_name: "Ball State", abbreviation: "BSU", conference: "MAC", prestige: 1, color_primary: "#BA0C2F", color_secondary: "#BBBCBC", city: "Muncie", state: "IN", arena_name: "Worthen Arena", arena_capacity: 11500 },
  { name: "Bowling Green State University", short_name: "Bowling Green", abbreviation: "BGSU", conference: "MAC", prestige: 1, color_primary: "#4F2C1D", color_secondary: "#FF6600", city: "Bowling Green", state: "OH", arena_name: "Stroh Center", arena_capacity: 4705 },
  { name: "University at Buffalo", short_name: "Buffalo", abbreviation: "BUFF", conference: "MAC", prestige: 2, color_primary: "#005BBB", color_secondary: "#FFFFFF", city: "Buffalo", state: "NY", arena_name: "Alumni Arena", arena_capacity: 6100 },
  { name: "Central Michigan University", short_name: "Central Michigan", abbreviation: "CMU", conference: "MAC", prestige: 1, color_primary: "#6A0032", color_secondary: "#FFC82E", city: "Mount Pleasant", state: "MI", arena_name: "McGuirk Arena", arena_capacity: 5200 },
  { name: "Eastern Michigan University", short_name: "Eastern Michigan", abbreviation: "EMU", conference: "MAC", prestige: 1, color_primary: "#007B5F", color_secondary: "#FFFFFF", city: "Ypsilanti", state: "MI", arena_name: "Convocation Center", arena_capacity: 8825 },
  { name: "Kent State University", short_name: "Kent State", abbreviation: "KENT", conference: "MAC", prestige: 2, color_primary: "#002664", color_secondary: "#EAAA00", city: "Kent", state: "OH", arena_name: "Memorial Athletic and Convocation Center", arena_capacity: 6327 },
  { name: "Miami University", short_name: "Miami (OH)", abbreviation: "MIOH", conference: "MAC", prestige: 2, color_primary: "#C3142D", color_secondary: "#FFFFFF", city: "Oxford", state: "OH", arena_name: "Millett Hall", arena_capacity: 9200 },
  { name: "Northern Illinois University", short_name: "Northern Illinois", abbreviation: "NIU", conference: "MAC", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "DeKalb", state: "IL", arena_name: "Convocation Center", arena_capacity: 10000 },
  { name: "Ohio University", short_name: "Ohio", abbreviation: "OHIO", conference: "MAC", prestige: 2, color_primary: "#00694E", color_secondary: "#CFC493", city: "Athens", state: "OH", arena_name: "Convocation Center", arena_capacity: 13000 },
  { name: "University of Toledo", short_name: "Toledo", abbreviation: "TOL", conference: "MAC", prestige: 2, color_primary: "#003F7F", color_secondary: "#FDC02F", city: "Toledo", state: "OH", arena_name: "Savage Arena", arena_capacity: 8000 },
  { name: "Western Michigan University", short_name: "Western Michigan", abbreviation: "WMU", conference: "MAC", prestige: 1, color_primary: "#6C4023", color_secondary: "#C5AA6C", city: "Kalamazoo", state: "MI", arena_name: "University Arena", arena_capacity: 5800 },

  // ────────────────────────────────────────────
  // Sun Belt (14)
  // ────────────────────────────────────────────
  { name: "Appalachian State University", short_name: "Appalachian State", abbreviation: "APP", conference: "Sun Belt", prestige: 1, color_primary: "#000000", color_secondary: "#FFCB05", city: "Boone", state: "NC", arena_name: "Holmes Convocation Center", arena_capacity: 8325 },
  { name: "Arkansas State University", short_name: "Arkansas State", abbreviation: "ARST", conference: "Sun Belt", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "Jonesboro", state: "AR", arena_name: "First National Bank Arena", arena_capacity: 10563 },
  { name: "Georgia Southern University", short_name: "Georgia Southern", abbreviation: "GASO", conference: "Sun Belt", prestige: 1, color_primary: "#003087", color_secondary: "#FFFFFF", city: "Statesboro", state: "GA", arena_name: "Hanner Fieldhouse", arena_capacity: 4700 },
  { name: "Georgia State University", short_name: "Georgia State", abbreviation: "GSU", conference: "Sun Belt", prestige: 1, color_primary: "#003087", color_secondary: "#CC0000", city: "Atlanta", state: "GA", arena_name: "Convocation Center", arena_capacity: 5000 },
  { name: "James Madison University", short_name: "James Madison", abbreviation: "JMU", conference: "Sun Belt", prestige: 1, color_primary: "#450084", color_secondary: "#CBB677", city: "Harrisonburg", state: "VA", arena_name: "Atlantic Union Bank Center", arena_capacity: 7500 },
  { name: "University of Louisiana Lafayette", short_name: "Louisiana", abbreviation: "ULL", conference: "Sun Belt", prestige: 1, color_primary: "#CE181E", color_secondary: "#000000", city: "Lafayette", state: "LA", arena_name: "Cajundome", arena_capacity: 12131 },
  { name: "University of Louisiana Monroe", short_name: "Louisiana Monroe", abbreviation: "ULM", conference: "Sun Belt", prestige: 1, color_primary: "#730000", color_secondary: "#CBA052", city: "Monroe", state: "LA", arena_name: "Fant-Ewing Coliseum", arena_capacity: 8000 },
  { name: "Marshall University", short_name: "Marshall", abbreviation: "MARS", conference: "Sun Belt", prestige: 1, color_primary: "#00B140", color_secondary: "#000000", city: "Huntington", state: "WV", arena_name: "Cam Henderson Center", arena_capacity: 9000 },
  { name: "Old Dominion University", short_name: "Old Dominion", abbreviation: "ODU", conference: "Sun Belt", prestige: 1, color_primary: "#003057", color_secondary: "#8FB2D8", city: "Norfolk", state: "VA", arena_name: "Chartway Arena", arena_capacity: 8472 },
  { name: "University of South Alabama", short_name: "South Alabama", abbreviation: "USA", conference: "Sun Belt", prestige: 1, color_primary: "#00205B", color_secondary: "#C8A96E", city: "Mobile", state: "AL", arena_name: "Mitchell Center", arena_capacity: 10000 },
  { name: "University of Southern Mississippi", short_name: "Southern Miss", abbreviation: "USM", conference: "Sun Belt", prestige: 1, color_primary: "#000000", color_secondary: "#FDC02F", city: "Hattiesburg", state: "MS", arena_name: "Reed Green Coliseum", arena_capacity: 8095 },
  { name: "Texas State University", short_name: "Texas State", abbreviation: "TXST", conference: "Sun Belt", prestige: 1, color_primary: "#461D7C", color_secondary: "#FFFFFF", city: "San Marcos", state: "TX", arena_name: "Strahan Arena", arena_capacity: 7200 },
  { name: "Troy University", short_name: "Troy", abbreviation: "TROY", conference: "Sun Belt", prestige: 1, color_primary: "#800000", color_secondary: "#000000", city: "Troy", state: "AL", arena_name: "Trojan Arena", arena_capacity: 5500 },
  { name: "University of Texas at El Paso", short_name: "UTEP", abbreviation: "UTEP", conference: "Sun Belt", prestige: 1, color_primary: "#FF671F", color_secondary: "#003594", city: "El Paso", state: "TX", arena_name: "Don Haskins Center", arena_capacity: 12000 },

  // ────────────────────────────────────────────
  // Big West (12)
  // ────────────────────────────────────────────
  { name: "Cal Poly", short_name: "Cal Poly", abbreviation: "CPY", conference: "Big West", prestige: 1, color_primary: "#154734", color_secondary: "#C69214", city: "San Luis Obispo", state: "CA", arena_name: "Mott Athletics Center", arena_capacity: 3032 },
  { name: "Cal State Bakersfield", short_name: "CS Bakersfield", abbreviation: "CSUB", conference: "Big West", prestige: 1, color_primary: "#003082", color_secondary: "#FFC72C", city: "Bakersfield", state: "CA", arena_name: "Mechanics Bank Arena", arena_capacity: 10500 },
  { name: "Cal State Fullerton", short_name: "CS Fullerton", abbreviation: "CSUF", conference: "Big West", prestige: 1, color_primary: "#003087", color_secondary: "#FF6600", city: "Fullerton", state: "CA", arena_name: "Titan Gymnasium", arena_capacity: 4000 },
  { name: "Cal State Northridge", short_name: "CS Northridge", abbreviation: "CSUN", conference: "Big West", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "Northridge", state: "CA", arena_name: "Premier America Credit Union Arena", arena_capacity: 9000 },
  { name: "UC Davis", short_name: "UC Davis", abbreviation: "UCD", conference: "Big West", prestige: 1, color_primary: "#002855", color_secondary: "#B3A369", city: "Davis", state: "CA", arena_name: "UC Davis Activities and Recreation Center", arena_capacity: 7200 },
  { name: "UC Irvine", short_name: "UC Irvine", abbreviation: "UCI", conference: "Big West", prestige: 2, color_primary: "#003764", color_secondary: "#0065A4", city: "Irvine", state: "CA", arena_name: "Bren Events Center", arena_capacity: 5000 },
  { name: "UC Riverside", short_name: "UC Riverside", abbreviation: "UCR", conference: "Big West", prestige: 1, color_primary: "#003DA5", color_secondary: "#F0AB00", city: "Riverside", state: "CA", arena_name: "Student Recreation Center", arena_capacity: 3168 },
  { name: "UC San Diego", short_name: "UC San Diego", abbreviation: "UCSD", conference: "Big West", prestige: 1, color_primary: "#182B49", color_secondary: "#00629B", city: "La Jolla", state: "CA", arena_name: "RIMAC Arena", arena_capacity: 5000 },
  { name: "UC Santa Barbara", short_name: "UC Santa Barbara", abbreviation: "UCSB", conference: "Big West", prestige: 2, color_primary: "#003660", color_secondary: "#FEBC11", city: "Santa Barbara", state: "CA", arena_name: "Thunderdome", arena_capacity: 6000 },
  { name: "Long Beach State", short_name: "Long Beach State", abbreviation: "LBS", conference: "Big West", prestige: 2, color_primary: "#000000", color_secondary: "#FDC02F", city: "Long Beach", state: "CA", arena_name: "The Walter Pyramid", arena_capacity: 4000 },
  { name: "University of Hawaii Hilo", short_name: "Hawaii Hilo", abbreviation: "HIHI", conference: "Big West", prestige: 1, color_primary: "#005A9C", color_secondary: "#FFFFFF", city: "Hilo", state: "HI", arena_name: "Vulcan Gymnasium", arena_capacity: 2000 },
  { name: "University of Nevada Las Vegas", short_name: "UNLV (BW)", abbreviation: "UNLBW", conference: "Big West", prestige: 1, color_primary: "#CF0A2C", color_secondary: "#666666", city: "Las Vegas", state: "NV", arena_name: "Thomas & Mack Center (BW)", arena_capacity: 18776 },

  // ────────────────────────────────────────────
  // Ivy League (8)
  // ────────────────────────────────────────────
  { name: "Brown University", short_name: "Brown", abbreviation: "BRN", conference: "Ivy League", prestige: 2, color_primary: "#4E3629", color_secondary: "#FFFFFF", city: "Providence", state: "RI", arena_name: "Pizzitola Sports Center", arena_capacity: 2800 },
  { name: "Columbia University", short_name: "Columbia", abbreviation: "COL", conference: "Ivy League", prestige: 2, color_primary: "#9BC4E2", color_secondary: "#FFFFFF", city: "New York", state: "NY", arena_name: "Levien Gymnasium", arena_capacity: 3408 },
  { name: "Cornell University", short_name: "Cornell", abbreviation: "COR", conference: "Ivy League", prestige: 2, color_primary: "#B31B1B", color_secondary: "#FFFFFF", city: "Ithaca", state: "NY", arena_name: "Newman Arena", arena_capacity: 4473 },
  { name: "Dartmouth College", short_name: "Dartmouth", abbreviation: "DART", conference: "Ivy League", prestige: 2, color_primary: "#00693E", color_secondary: "#FFFFFF", city: "Hanover", state: "NH", arena_name: "Leede Arena", arena_capacity: 2100 },
  { name: "Harvard University", short_name: "Harvard", abbreviation: "HARV", conference: "Ivy League", prestige: 3, color_primary: "#A51C30", color_secondary: "#FFFFFF", city: "Cambridge", state: "MA", arena_name: "Lavietes Pavilion", arena_capacity: 2195 },
  { name: "University of Pennsylvania", short_name: "Pennsylvania", abbreviation: "PENN", conference: "Ivy League", prestige: 3, color_primary: "#011F5B", color_secondary: "#990000", city: "Philadelphia", state: "PA", arena_name: "Palestra", arena_capacity: 8722 },
  { name: "Princeton University", short_name: "Princeton", abbreviation: "PRIN", conference: "Ivy League", prestige: 3, color_primary: "#FF6600", color_secondary: "#000000", city: "Princeton", state: "NJ", arena_name: "Jadwin Gymnasium", arena_capacity: 6854 },
  { name: "Yale University", short_name: "Yale", abbreviation: "YALE", conference: "Ivy League", prestige: 2, color_primary: "#00356B", color_secondary: "#FFFFFF", city: "New Haven", state: "CT", arena_name: "John J. Lee Amphitheater", arena_capacity: 3100 },

  // ────────────────────────────────────────────
  // Patriot League (10)
  // ────────────────────────────────────────────
  { name: "American University", short_name: "American", abbreviation: "AMU", conference: "Patriot League", prestige: 1, color_primary: "#C4022A", color_secondary: "#002F65", city: "Washington", state: "DC", arena_name: "Bender Arena", arena_capacity: 4600 },
  { name: "Army West Point", short_name: "Army", abbreviation: "ARMY", conference: "Patriot League", prestige: 1, color_primary: "#000000", color_secondary: "#D4AF37", city: "West Point", state: "NY", arena_name: "Christl Arena", arena_capacity: 5043 },
  { name: "Bucknell University", short_name: "Bucknell", abbreviation: "BUCK", conference: "Patriot League", prestige: 1, color_primary: "#003366", color_secondary: "#E87722", city: "Lewisburg", state: "PA", arena_name: "Sojka Pavilion", arena_capacity: 5500 },
  { name: "Colgate University", short_name: "Colgate", abbreviation: "COLG", conference: "Patriot League", prestige: 1, color_primary: "#82122B", color_secondary: "#000000", city: "Hamilton", state: "NY", arena_name: "Cotterell Court", arena_capacity: 3750 },
  { name: "Holy Cross College", short_name: "Holy Cross", abbreviation: "HC", conference: "Patriot League", prestige: 2, color_primary: "#602D91", color_secondary: "#FFFFFF", city: "Worcester", state: "MA", arena_name: "Hart Recreation Center", arena_capacity: 3600 },
  { name: "Lafayette College", short_name: "Lafayette", abbreviation: "LAF", conference: "Patriot League", prestige: 1, color_primary: "#920000", color_secondary: "#FFFFFF", city: "Easton", state: "PA", arena_name: "Kirby Sports Center", arena_capacity: 3500 },
  { name: "Lehigh University", short_name: "Lehigh", abbreviation: "LEH", conference: "Patriot League", prestige: 1, color_primary: "#653700", color_secondary: "#FFFFFF", city: "Bethlehem", state: "PA", arena_name: "Stabler Arena", arena_capacity: 6000 },
  { name: "Loyola University Maryland", short_name: "Loyola Maryland", abbreviation: "LOMD", conference: "Patriot League", prestige: 1, color_primary: "#006F42", color_secondary: "#999999", city: "Baltimore", state: "MD", arena_name: "Reitz Arena", arena_capacity: 3000 },
  { name: "Navy", short_name: "Navy (PL)", abbreviation: "NAVPL", conference: "Patriot League", prestige: 1, color_primary: "#00205B", color_secondary: "#C5B783", city: "Annapolis", state: "MD", arena_name: "Alumni Hall (PL)", arena_capacity: 5710 },
  { name: "Boston University", short_name: "Boston U", abbreviation: "BU", conference: "Patriot League", prestige: 2, color_primary: "#CC0000", color_secondary: "#000000", city: "Boston", state: "MA", arena_name: "Agganis Arena", arena_capacity: 6224 },

  // ────────────────────────────────────────────
  // MAAC (11)
  // ────────────────────────────────────────────
  { name: "Canisius University", short_name: "Canisius", abbreviation: "CAN", conference: "MAAC", prestige: 1, color_primary: "#003399", color_secondary: "#FFD700", city: "Buffalo", state: "NY", arena_name: "Koessler Athletic Center", arena_capacity: 2176 },
  { name: "Fairfield University", short_name: "Fairfield", abbreviation: "FAIR", conference: "MAAC", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Fairfield", state: "CT", arena_name: "Webster Bank Arena", arena_capacity: 9594 },
  { name: "Iona University", short_name: "Iona", abbreviation: "IONA", conference: "MAAC", prestige: 2, color_primary: "#8A0029", color_secondary: "#937B4E", city: "New Rochelle", state: "NY", arena_name: "Hynes Athletics Center", arena_capacity: 2500 },
  { name: "Manhattan College", short_name: "Manhattan", abbreviation: "MAN", conference: "MAAC", prestige: 1, color_primary: "#003082", color_secondary: "#007A53", city: "Riverdale", state: "NY", arena_name: "Draddy Gymnasium", arena_capacity: 3000 },
  { name: "Marist College", short_name: "Marist", abbreviation: "MAR", conference: "MAAC", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Poughkeepsie", state: "NY", arena_name: "McCann Recreation Center", arena_capacity: 3944 },
  { name: "Monmouth University", short_name: "Monmouth", abbreviation: "MONM", conference: "MAAC", prestige: 1, color_primary: "#003087", color_secondary: "#FFFFFF", city: "West Long Branch", state: "NJ", arena_name: "OceanFirst Bank Center", arena_capacity: 4100 },
  { name: "Niagara University", short_name: "Niagara", abbreviation: "NIA", conference: "MAAC", prestige: 1, color_primary: "#4E2683", color_secondary: "#FFFFFF", city: "Lewiston", state: "NY", arena_name: "Gallagher Center", arena_capacity: 3400 },
  { name: "Quinnipiac University", short_name: "Quinnipiac", abbreviation: "QUIN", conference: "MAAC", prestige: 1, color_primary: "#0C2340", color_secondary: "#D1A827", city: "Hamden", state: "CT", arena_name: "People's United Center", arena_capacity: 3570 },
  { name: "Rider University", short_name: "Rider", abbreviation: "RID", conference: "MAAC", prestige: 1, color_primary: "#A80532", color_secondary: "#333333", city: "Lawrenceville", state: "NJ", arena_name: "Alumni Gymnasium", arena_capacity: 1800 },
  { name: "Siena College", short_name: "Siena", abbreviation: "SIEN", conference: "MAAC", prestige: 1, color_primary: "#005500", color_secondary: "#FFD700", city: "Loudonville", state: "NY", arena_name: "Times Union Center", arena_capacity: 17500 },
  { name: "Saint Peter's University", short_name: "Saint Peter's", abbreviation: "SPU", conference: "MAAC", prestige: 1, color_primary: "#004B8D", color_secondary: "#FFFFFF", city: "Jersey City", state: "NJ", arena_name: "Run Baby Run Arena", arena_capacity: 3200 },

  // ────────────────────────────────────────────
  // CAA (11)
  // ────────────────────────────────────────────
  { name: "Campbell University", short_name: "Campbell", abbreviation: "CAMP", conference: "CAA", prestige: 1, color_primary: "#F26722", color_secondary: "#000000", city: "Buies Creek", state: "NC", arena_name: "John W. Pope Jr. Convocation Center", arena_capacity: 3500 },
  { name: "College of Charleston", short_name: "Charleston", abbreviation: "CHRL", conference: "CAA", prestige: 2, color_primary: "#4F2D0E", color_secondary: "#BFAB6E", city: "Charleston", state: "SC", arena_name: "TD Arena", arena_capacity: 5100 },
  { name: "Delaware University", short_name: "Delaware", abbreviation: "DEL", conference: "CAA", prestige: 1, color_primary: "#00539F", color_secondary: "#FFD200", city: "Newark", state: "DE", arena_name: "Bob Carpenter Center", arena_capacity: 5100 },
  { name: "Drexel University", short_name: "Drexel", abbreviation: "DREX", conference: "CAA", prestige: 1, color_primary: "#07294D", color_secondary: "#FFC600", city: "Philadelphia", state: "PA", arena_name: "Daskalakis Athletic Center", arena_capacity: 2300 },
  { name: "Elon University", short_name: "Elon", abbreviation: "ELON", conference: "CAA", prestige: 1, color_primary: "#8A0029", color_secondary: "#BFAF80", city: "Elon", state: "NC", arena_name: "Schar Center", arena_capacity: 5100 },
  { name: "Hampton University", short_name: "Hampton", abbreviation: "HAM", conference: "CAA", prestige: 1, color_primary: "#003366", color_secondary: "#BFAF80", city: "Hampton", state: "VA", arena_name: "Convocation Center", arena_capacity: 7200 },
  { name: "Monmouth University", short_name: "Monmouth (CAA)", abbreviation: "MCAA", conference: "CAA", prestige: 1, color_primary: "#003087", color_secondary: "#FFFFFF", city: "West Long Branch", state: "NJ", arena_name: "OceanFirst Bank Center", arena_capacity: 4100 },
  { name: "Northeastern University", short_name: "Northeastern", abbreviation: "NEU", conference: "CAA", prestige: 2, color_primary: "#CC0000", color_secondary: "#000000", city: "Boston", state: "MA", arena_name: "Cabot Center", arena_capacity: 2500 },
  { name: "Stony Brook University", short_name: "Stony Brook", abbreviation: "SBU", conference: "CAA", prestige: 1, color_primary: "#CC0000", color_secondary: "#808080", city: "Stony Brook", state: "NY", arena_name: "Island Federal Arena", arena_capacity: 4160 },
  { name: "Towson University", short_name: "Towson", abbreviation: "TOW", conference: "CAA", prestige: 1, color_primary: "#000000", color_secondary: "#FFC600", city: "Towson", state: "MD", arena_name: "SECU Arena", arena_capacity: 5000 },
  { name: "William & Mary", short_name: "William & Mary", abbreviation: "WM", conference: "CAA", prestige: 1, color_primary: "#115740", color_secondary: "#B9975B", city: "Williamsburg", state: "VA", arena_name: "Kaplan Arena", arena_capacity: 8600 },

  // ────────────────────────────────────────────
  // Big South (10)
  // ────────────────────────────────────────────
  { name: "Bellarmine University", short_name: "Bellarmine", abbreviation: "BELL", conference: "Big South", prestige: 1, color_primary: "#002868", color_secondary: "#BF0811", city: "Louisville", state: "KY", arena_name: "Knights Hall", arena_capacity: 3000 },
  { name: "Charleston Southern University", short_name: "Charleston Southern", abbreviation: "CSU", conference: "Big South", prestige: 1, color_primary: "#003087", color_secondary: "#FFFFFF", city: "Charleston", state: "SC", arena_name: "CSU Fieldhouse", arena_capacity: 2100 },
  { name: "Gardner-Webb University", short_name: "Gardner-Webb", abbreviation: "GWU", conference: "Big South", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "Boiling Springs", state: "NC", arena_name: "Paul Porter Arena", arena_capacity: 2500 },
  { name: "High Point University", short_name: "High Point", abbreviation: "HPU", conference: "Big South", prestige: 1, color_primary: "#4B2682", color_secondary: "#FFFFFF", city: "High Point", state: "NC", arena_name: "Millis Athletic Convocation Center", arena_capacity: 3000 },
  { name: "Longwood University", short_name: "Longwood", abbreviation: "LONG", conference: "Big South", prestige: 1, color_primary: "#003366", color_secondary: "#FFFFFF", city: "Farmville", state: "VA", arena_name: "Willett Hall", arena_capacity: 2500 },
  { name: "Presbyterian College", short_name: "Presbyterian", abbreviation: "PRES", conference: "Big South", prestige: 1, color_primary: "#003366", color_secondary: "#C5A800", city: "Clinton", state: "SC", arena_name: "Templeton Center", arena_capacity: 1900 },
  { name: "Radford University", short_name: "Radford", abbreviation: "RAD", conference: "Big South", prestige: 1, color_primary: "#003082", color_secondary: "#E8CB37", city: "Radford", state: "VA", arena_name: "Dedmon Center", arena_capacity: 5000 },
  { name: "South Carolina Upstate", short_name: "USC Upstate", abbreviation: "USCU", conference: "Big South", prestige: 1, color_primary: "#046A38", color_secondary: "#FFFFFF", city: "Spartanburg", state: "SC", arena_name: "Hodge Center", arena_capacity: 5000 },
  { name: "UNC Asheville", short_name: "UNC Asheville", abbreviation: "UNCA", conference: "Big South", prestige: 1, color_primary: "#003087", color_secondary: "#FFFFFF", city: "Asheville", state: "NC", arena_name: "Kimmel Arena", arena_capacity: 4200 },
  { name: "Winthrop University", short_name: "Winthrop", abbreviation: "WIN", conference: "Big South", prestige: 2, color_primary: "#872434", color_secondary: "#B5A165", city: "Rock Hill", state: "SC", arena_name: "Winthrop Coliseum", arena_capacity: 6100 },

  // ────────────────────────────────────────────
  // Horizon League (10)
  // ────────────────────────────────────────────
  { name: "Cleveland State University", short_name: "Cleveland State", abbreviation: "CLST", conference: "Horizon League", prestige: 1, color_primary: "#006747", color_secondary: "#FFFFFF", city: "Cleveland", state: "OH", arena_name: "Wolstein Center", arena_capacity: 13610 },
  { name: "Detroit Mercy", short_name: "Detroit Mercy", abbreviation: "DET", conference: "Horizon League", prestige: 1, color_primary: "#002776", color_secondary: "#D40026", city: "Detroit", state: "MI", arena_name: "Calihan Hall", arena_capacity: 8295 },
  { name: "Green Bay University", short_name: "Green Bay", abbreviation: "GRBY", conference: "Horizon League", prestige: 1, color_primary: "#00471B", color_secondary: "#FFB81C", city: "Green Bay", state: "WI", arena_name: "Kress Center", arena_capacity: 4400 },
  { name: "IUPUI", short_name: "IUPUI", abbreviation: "IUPU", conference: "Horizon League", prestige: 1, color_primary: "#9E1B32", color_secondary: "#BBBCBC", city: "Indianapolis", state: "IN", arena_name: "Indiana Farmers Coliseum", arena_capacity: 9100 },
  { name: "Milwaukee University", short_name: "Milwaukee", abbreviation: "MILW", conference: "Horizon League", prestige: 1, color_primary: "#000000", color_secondary: "#FFC72C", city: "Milwaukee", state: "WI", arena_name: "Panther Arena", arena_capacity: 12700 },
  { name: "Northern Kentucky University", short_name: "Northern Kentucky", abbreviation: "NKU", conference: "Horizon League", prestige: 1, color_primary: "#003087", color_secondary: "#FFD100", city: "Highland Heights", state: "KY", arena_name: "BB&T Arena", arena_capacity: 9400 },
  { name: "Oakland University", short_name: "Oakland", abbreviation: "OAK", conference: "Horizon League", prestige: 1, color_primary: "#000000", color_secondary: "#BFAF80", city: "Rochester Hills", state: "MI", arena_name: "O'rena", arena_capacity: 4800 },
  { name: "Purdue Fort Wayne", short_name: "Purdue Fort Wayne", abbreviation: "PFW", conference: "Horizon League", prestige: 1, color_primary: "#CC5500", color_secondary: "#000000", city: "Fort Wayne", state: "IN", arena_name: "Memorial Coliseum", arena_capacity: 11000 },
  { name: "Robert Morris University", short_name: "Robert Morris", abbreviation: "RMU", conference: "Horizon League", prestige: 1, color_primary: "#003087", color_secondary: "#CC0000", city: "Moon Township", state: "PA", arena_name: "UPMC Events Center", arena_capacity: 4000 },
  { name: "Wright State University", short_name: "Wright State", abbreviation: "WSU", conference: "Horizon League", prestige: 1, color_primary: "#006338", color_secondary: "#C69214", city: "Dayton", state: "OH", arena_name: "Nutter Center", arena_capacity: 11019 },

  // ────────────────────────────────────────────
  // Summit League (10)
  // ────────────────────────────────────────────
  { name: "Denver University", short_name: "Denver", abbreviation: "DEN", conference: "Summit League", prestige: 1, color_primary: "#244D99", color_secondary: "#CC0000", city: "Denver", state: "CO", arena_name: "Magness Arena", arena_capacity: 7200 },
  { name: "Kansas City University", short_name: "Kansas City", abbreviation: "UMKC", conference: "Summit League", prestige: 1, color_primary: "#003082", color_secondary: "#FFC600", city: "Kansas City", state: "MO", arena_name: "Swinney Recreation Center", arena_capacity: 4000 },
  { name: "North Dakota University", short_name: "North Dakota", abbreviation: "NDAK", conference: "Summit League", prestige: 1, color_primary: "#003F7D", color_secondary: "#1A9143", city: "Grand Forks", state: "ND", arena_name: "Betty Engelstad Sioux Center", arena_capacity: 3851 },
  { name: "North Dakota State University", short_name: "NDSU", abbreviation: "NDSU", conference: "Summit League", prestige: 1, color_primary: "#006633", color_secondary: "#FFC600", city: "Fargo", state: "ND", arena_name: "Scheels Center", arena_capacity: 5000 },
  { name: "Omaha University", short_name: "Omaha", abbreviation: "OMA", conference: "Summit League", prestige: 1, color_primary: "#000000", color_secondary: "#D2000D", city: "Omaha", state: "NE", arena_name: "Baxter Arena", arena_capacity: 7400 },
  { name: "Oral Roberts University", short_name: "Oral Roberts", abbreviation: "ORU", conference: "Summit League", prestige: 2, color_primary: "#004B8D", color_secondary: "#C69214", city: "Tulsa", state: "OK", arena_name: "Mabee Center", arena_capacity: 10575 },
  { name: "South Dakota State University", short_name: "South Dakota State", abbreviation: "SDST", conference: "Summit League", prestige: 2, color_primary: "#003DA5", color_secondary: "#FFD100", city: "Brookings", state: "SD", arena_name: "Frost Arena", arena_capacity: 6500 },
  { name: "South Dakota University", short_name: "South Dakota", abbreviation: "SDAK", conference: "Summit League", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Vermillion", state: "SD", arena_name: "DakotaDome", arena_capacity: 10000 },
  { name: "St. Thomas University", short_name: "St. Thomas", abbreviation: "STTU", conference: "Summit League", prestige: 1, color_primary: "#6A0D3B", color_secondary: "#C5A800", city: "St. Paul", state: "MN", arena_name: "Schoenecker Arena", arena_capacity: 3000 },
  { name: "Western Illinois University", short_name: "Western Illinois", abbreviation: "WIU", conference: "Summit League", prestige: 1, color_primary: "#6B0D3A", color_secondary: "#FFC600", city: "Macomb", state: "IL", arena_name: "Western Hall", arena_capacity: 5139 },

  // ────────────────────────────────────────────
  // America East (9)
  // ────────────────────────────────────────────
  { name: "Binghamton University", short_name: "Binghamton", abbreviation: "BING", conference: "America East", prestige: 1, color_primary: "#005F61", color_secondary: "#FFFFFF", city: "Vestal", state: "NY", arena_name: "Events Center", arena_capacity: 5144 },
  { name: "Hartford University", short_name: "Hartford", abbreviation: "HART", conference: "America East", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "West Hartford", state: "CT", arena_name: "XL Center", arena_capacity: 15000 },
  { name: "Maine University", short_name: "Maine", abbreviation: "MAINE", conference: "America East", prestige: 1, color_primary: "#003C97", color_secondary: "#B0D7FF", city: "Orono", state: "ME", arena_name: "Cross Insurance Center", arena_capacity: 6700 },
  { name: "University of Maryland Baltimore County", short_name: "UMBC", abbreviation: "UMBC", conference: "America East", prestige: 2, color_primary: "#000000", color_secondary: "#FDB515", city: "Catonsville", state: "MD", arena_name: "Event Center", arena_capacity: 4500 },
  { name: "University of Massachusetts Lowell", short_name: "UMass Lowell", abbreviation: "UMAL", conference: "America East", prestige: 1, color_primary: "#003087", color_secondary: "#C8A32A", city: "Lowell", state: "MA", arena_name: "Tsongas Center", arena_capacity: 6500 },
  { name: "University of New Hampshire", short_name: "New Hampshire", abbreviation: "UNH", conference: "America East", prestige: 1, color_primary: "#003087", color_secondary: "#FFFFFF", city: "Durham", state: "NH", arena_name: "Lundholm Gymnasium", arena_capacity: 3000 },
  { name: "NJIT", short_name: "NJIT", abbreviation: "NJIT", conference: "America East", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Newark", state: "NJ", arena_name: "Wellness and Events Center", arena_capacity: 2000 },
  { name: "University of Vermont", short_name: "Vermont", abbreviation: "UVM", conference: "America East", prestige: 2, color_primary: "#007A33", color_secondary: "#FFD100", city: "Burlington", state: "VT", arena_name: "Patrick Gymnasium", arena_capacity: 3228 },
  { name: "Albany University", short_name: "Albany", abbreviation: "ALB", conference: "America East", prestige: 1, color_primary: "#461D7C", color_secondary: "#FDB515", city: "Albany", state: "NY", arena_name: "SEFCU Arena", arena_capacity: 4762 },

  // ────────────────────────────────────────────
  // Big Sky (12)
  // ────────────────────────────────────────────
  { name: "Eastern Washington University", short_name: "Eastern Washington", abbreviation: "EWU", conference: "Big Sky", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Cheney", state: "WA", arena_name: "Reese Court", arena_capacity: 6000 },
  { name: "Idaho State University", short_name: "Idaho State", abbreviation: "IDST", conference: "Big Sky", prestige: 1, color_primary: "#F47321", color_secondary: "#000000", city: "Pocatello", state: "ID", arena_name: "Reed Gymnasium", arena_capacity: 8000 },
  { name: "Montana State University", short_name: "Montana State", abbreviation: "MTST", conference: "Big Sky", prestige: 1, color_primary: "#003087", color_secondary: "#C69214", city: "Bozeman", state: "MT", arena_name: "Brick Breeden Fieldhouse", arena_capacity: 7250 },
  { name: "Montana University", short_name: "Montana", abbreviation: "MONT", conference: "Big Sky", prestige: 1, color_primary: "#720000", color_secondary: "#999999", city: "Missoula", state: "MT", arena_name: "Adams Center", arena_capacity: 7321 },
  { name: "Northern Arizona University", short_name: "Northern Arizona", abbreviation: "NAU", conference: "Big Sky", prestige: 1, color_primary: "#003F7D", color_secondary: "#FFD100", city: "Flagstaff", state: "AZ", arena_name: "Rolle Activity Center", arena_capacity: 7000 },
  { name: "Northern Colorado University", short_name: "Northern Colorado", abbreviation: "UNC", conference: "Big Sky", prestige: 1, color_primary: "#013C65", color_secondary: "#FFD200", city: "Greeley", state: "CO", arena_name: "Butler-Hancock Athletic Center", arena_capacity: 4000 },
  { name: "Portland State University", short_name: "Portland State", abbreviation: "PDXST", conference: "Big Sky", prestige: 1, color_primary: "#154734", color_secondary: "#FFFFFF", city: "Portland", state: "OR", arena_name: "Peter W. Stott Center", arena_capacity: 1800 },
  { name: "Sacramento State University", short_name: "Sacramento State", abbreviation: "SACST", conference: "Big Sky", prestige: 1, color_primary: "#006338", color_secondary: "#BF9B2F", city: "Sacramento", state: "CA", arena_name: "Sacramento State Aquatic Center", arena_capacity: 1200 },
  { name: "Southern Utah University", short_name: "Southern Utah", abbreviation: "SUU", conference: "Big Sky", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "Cedar City", state: "UT", arena_name: "America First Event Center", arena_capacity: 5300 },
  { name: "University of Idaho", short_name: "Idaho", abbreviation: "IDAHO", conference: "Big Sky", prestige: 1, color_primary: "#003082", color_secondary: "#C8A32A", city: "Moscow", state: "ID", arena_name: "ICCU Arena", arena_capacity: 5000 },
  { name: "Weber State University", short_name: "Weber State", abbreviation: "WEBST", conference: "Big Sky", prestige: 1, color_primary: "#492F91", color_secondary: "#FFFFFF", city: "Ogden", state: "UT", arena_name: "Dee Events Center", arena_capacity: 11900 },
  { name: "Eastern Oregon University", short_name: "Eastern Oregon", abbreviation: "EOU", conference: "Big Sky", prestige: 1, color_primary: "#002D62", color_secondary: "#FFD100", city: "La Grande", state: "OR", arena_name: "Loso Hall", arena_capacity: 2000 },

  // ────────────────────────────────────────────
  // Southern Conference (10)
  // ────────────────────────────────────────────
  { name: "Furman University", short_name: "Furman", abbreviation: "FUR", conference: "Southern", prestige: 1, color_primary: "#582C83", color_secondary: "#FFFFFF", city: "Greenville", state: "SC", arena_name: "Timmons Arena", arena_capacity: 5000 },
  { name: "Mercer University", short_name: "Mercer", abbreviation: "MERC", conference: "Southern", prestige: 1, color_primary: "#F37021", color_secondary: "#000000", city: "Macon", state: "GA", arena_name: "Hawkins Arena", arena_capacity: 3200 },
  { name: "Samford University", short_name: "Samford", abbreviation: "SAM", conference: "Southern", prestige: 1, color_primary: "#003082", color_secondary: "#CC0000", city: "Birmingham", state: "AL", arena_name: "Pete Hanna Center", arena_capacity: 4000 },
  { name: "The Citadel", short_name: "The Citadel", abbreviation: "CIT", conference: "Southern", prestige: 1, color_primary: "#003082", color_secondary: "#C69214", city: "Charleston", state: "SC", arena_name: "McAlister Field House", arena_capacity: 5800 },
  { name: "VMI", short_name: "VMI", abbreviation: "VMI", conference: "Southern", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFC600", city: "Lexington", state: "VA", arena_name: "Cameron Hall", arena_capacity: 5029 },
  { name: "Western Carolina University", short_name: "Western Carolina", abbreviation: "WCU", conference: "Southern", prestige: 1, color_primary: "#592C88", color_secondary: "#CFC88A", city: "Cullowhee", state: "NC", arena_name: "Ramsey Regional Activity Center", arena_capacity: 7826 },
  { name: "Wofford College", short_name: "Wofford", abbreviation: "WOF", conference: "Southern", prestige: 1, color_primary: "#896329", color_secondary: "#000000", city: "Spartanburg", state: "SC", arena_name: "Jerry Richardson Indoor Stadium", arena_capacity: 3500 },
  { name: "East Tennessee State University", short_name: "ETSU", abbreviation: "ETSU", conference: "Southern", prestige: 1, color_primary: "#041E42", color_secondary: "#BFAF80", city: "Johnson City", state: "TN", arena_name: "Freedom Hall Civic Center", arena_capacity: 7500 },
  { name: "Chattanooga University", short_name: "Chattanooga", abbreviation: "CHAT", conference: "Southern", prestige: 1, color_primary: "#00386B", color_secondary: "#FFC600", city: "Chattanooga", state: "TN", arena_name: "McKenzie Arena", arena_capacity: 11218 },
  { name: "UNC Greensboro", short_name: "UNC Greensboro", abbreviation: "UNCG", conference: "Southern", prestige: 1, color_primary: "#004B8D", color_secondary: "#FFD100", city: "Greensboro", state: "NC", arena_name: "Fleming Gymnasium", arena_capacity: 2300 },

  // ────────────────────────────────────────────
  // WAC (8)
  // ────────────────────────────────────────────
  { name: "Abilene Christian University", short_name: "Abilene Christian", abbreviation: "ACU", conference: "WAC", prestige: 1, color_primary: "#461D7C", color_secondary: "#BFAF80", city: "Abilene", state: "TX", arena_name: "Teague Special Events Center", arena_capacity: 5000 },
  { name: "California Baptist University", short_name: "Cal Baptist", abbreviation: "CBU", conference: "WAC", prestige: 1, color_primary: "#003082", color_secondary: "#C8A32A", city: "Riverside", state: "CA", arena_name: "CBU Events Center", arena_capacity: 4000 },
  { name: "Grand Canyon University", short_name: "Grand Canyon", abbreviation: "GCU", conference: "WAC", prestige: 2, color_primary: "#522398", color_secondary: "#007DC5", city: "Phoenix", state: "AZ", arena_name: "GCU Arena", arena_capacity: 7000 },
  { name: "Lamar University", short_name: "Lamar", abbreviation: "LAM", conference: "WAC", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Beaumont", state: "TX", arena_name: "Montagne Center", arena_capacity: 10080 },
  { name: "New Mexico State University", short_name: "New Mexico State", abbreviation: "NMST", conference: "WAC", prestige: 2, color_primary: "#891625", color_secondary: "#BF9B2F", city: "Las Cruces", state: "NM", arena_name: "Pan American Center", arena_capacity: 13222 },
  { name: "Sam Houston State University", short_name: "Sam Houston", abbreviation: "SHSU", conference: "WAC", prestige: 1, color_primary: "#FF7F00", color_secondary: "#FFFFFF", city: "Huntsville", state: "TX", arena_name: "Bernard G. Johnson Coliseum", arena_capacity: 6131 },
  { name: "Stephen F. Austin State University", short_name: "Stephen F. Austin", abbreviation: "SFA", conference: "WAC", prestige: 1, color_primary: "#472773", color_secondary: "#FFFFFF", city: "Nacogdoches", state: "TX", arena_name: "William R. Johnson Coliseum", arena_capacity: 7203 },
  { name: "Tarleton State University", short_name: "Tarleton State", abbreviation: "TAST", conference: "WAC", prestige: 1, color_primary: "#4B2683", color_secondary: "#FFFFFF", city: "Stephenville", state: "TX", arena_name: "Wisdom Gym", arena_capacity: 3000 },

  // ────────────────────────────────────────────
  // Southland (9)
  // ────────────────────────────────────────────
  { name: "Houston Baptist University", short_name: "Houston Baptist", abbreviation: "HBU", conference: "Southland", prestige: 1, color_primary: "#003082", color_secondary: "#CC0000", city: "Houston", state: "TX", arena_name: "Sharp Gymnasium", arena_capacity: 1800 },
  { name: "Incarnate Word University", short_name: "Incarnate Word", abbreviation: "IWU", conference: "Southland", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "San Antonio", state: "TX", arena_name: "AISD Tech High School Gym", arena_capacity: 2500 },
  { name: "Nicholls State University", short_name: "Nicholls State", abbreviation: "NICH", conference: "Southland", prestige: 1, color_primary: "#CC0000", color_secondary: "#C0C0C0", city: "Thibodaux", state: "LA", arena_name: "Stopher Gymnasium", arena_capacity: 3800 },
  { name: "Northwestern State University", short_name: "Northwestern State", abbreviation: "NWST", conference: "Southland", prestige: 1, color_primary: "#FF6600", color_secondary: "#003082", city: "Natchitoches", state: "LA", arena_name: "Prather Coliseum", arena_capacity: 3800 },
  { name: "Southeastern Louisiana University", short_name: "Southeastern Louisiana", abbreviation: "SELU", conference: "Southland", prestige: 1, color_primary: "#006633", color_secondary: "#FFFFFF", city: "Hammond", state: "LA", arena_name: "University Center", arena_capacity: 7500 },
  { name: "Texas A&M Corpus Christi", short_name: "TAMU Corpus Christi", abbreviation: "TAMC", conference: "Southland", prestige: 1, color_primary: "#004B8D", color_secondary: "#00A693", city: "Corpus Christi", state: "TX", arena_name: "American Bank Center", arena_capacity: 10500 },
  { name: "Texas Southern University", short_name: "Texas Southern", abbreviation: "TXSU", conference: "Southland", prestige: 1, color_primary: "#872434", color_secondary: "#BFAF80", city: "Houston", state: "TX", arena_name: "H&PE Arena", arena_capacity: 8100 },
  { name: "University of New Orleans", short_name: "New Orleans", abbreviation: "UNO", conference: "Southland", prestige: 1, color_primary: "#002F6C", color_secondary: "#C8A32A", city: "New Orleans", state: "LA", arena_name: "Lakefront Arena", arena_capacity: 10000 },
  { name: "McNeese State University", short_name: "McNeese State", abbreviation: "MCST", conference: "Southland", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Lake Charles", state: "LA", arena_name: "Burton Coliseum", arena_capacity: 8000 },

  // ────────────────────────────────────────────
  // SWAC (12)
  // ────────────────────────────────────────────
  { name: "Alcorn State University", short_name: "Alcorn State", abbreviation: "ALST", conference: "SWAC", prestige: 1, color_primary: "#6B2737", color_secondary: "#CCA752", city: "Lorman", state: "MS", arena_name: "Davey L. Whitney Complex", arena_capacity: 7000 },
  { name: "Alabama A&M University", short_name: "Alabama A&M", abbreviation: "AAMU", conference: "SWAC", prestige: 1, color_primary: "#770000", color_secondary: "#FFFFFF", city: "Normal", state: "AL", arena_name: "Elmore Gymnasium", arena_capacity: 5000 },
  { name: "Alabama State University", short_name: "Alabama State", abbreviation: "ALST2", conference: "SWAC", prestige: 1, color_primary: "#000000", color_secondary: "#FDD023", city: "Montgomery", state: "AL", arena_name: "Dunn-Oliver Acadome", arena_capacity: 7000 },
  { name: "Arkansas Pine Bluff University", short_name: "Arkansas Pine Bluff", abbreviation: "UAPB", conference: "SWAC", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Pine Bluff", state: "AR", arena_name: "H.O. Clemmons Arena", arena_capacity: 6000 },
  { name: "Bethune-Cookman University", short_name: "Bethune-Cookman", abbreviation: "BCU", conference: "SWAC", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "Daytona Beach", state: "FL", arena_name: "Moore Gymnasium", arena_capacity: 2500 },
  { name: "Florida A&M University", short_name: "Florida A&M", abbreviation: "FAMU", conference: "SWAC", prestige: 1, color_primary: "#F47B20", color_secondary: "#003082", city: "Tallahassee", state: "FL", arena_name: "Al Lawson Multipurpose Center", arena_capacity: 9000 },
  { name: "Grambling State University", short_name: "Grambling State", abbreviation: "GRAM", conference: "SWAC", prestige: 1, color_primary: "#000000", color_secondary: "#FFD100", city: "Grambling", state: "LA", arena_name: "Memorial Gymnasium", arena_capacity: 4000 },
  { name: "Jackson State University", short_name: "Jackson State", abbreviation: "JKST", conference: "SWAC", prestige: 1, color_primary: "#003082", color_secondary: "#CC0000", city: "Jackson", state: "MS", arena_name: "Lee E. Williams Athletics & Assembly Center", arena_capacity: 8000 },
  { name: "Mississippi Valley State University", short_name: "Mississippi Valley State", abbreviation: "MVST", conference: "SWAC", prestige: 1, color_primary: "#003082", color_secondary: "#009900", city: "Itta Bena", state: "MS", arena_name: "Harrison Complex", arena_capacity: 6000 },
  { name: "Prairie View A&M University", short_name: "Prairie View A&M", abbreviation: "PVAM", conference: "SWAC", prestige: 1, color_primary: "#4B2C7A", color_secondary: "#FFD100", city: "Prairie View", state: "TX", arena_name: "Nicks Athletic Complex", arena_capacity: 6000 },
  { name: "Southern University", short_name: "Southern", abbreviation: "SOUR", conference: "SWAC", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Baton Rouge", state: "LA", arena_name: "F.G. Clark Activity Center", arena_capacity: 7500 },
  { name: "Texas Southern University", short_name: "Texas Southern (SWAC)", abbreviation: "TXSW", conference: "SWAC", prestige: 1, color_primary: "#872434", color_secondary: "#BFAF80", city: "Houston", state: "TX", arena_name: "H&PE Arena (SWAC)", arena_capacity: 8100 },

  // ────────────────────────────────────────────
  // MEAC (9)
  // ────────────────────────────────────────────
  { name: "Coppin State University", short_name: "Coppin State", abbreviation: "COPST", conference: "MEAC", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Baltimore", state: "MD", arena_name: "Physical Education Complex", arena_capacity: 4000 },
  { name: "Delaware State University", short_name: "Delaware State", abbreviation: "DLST", conference: "MEAC", prestige: 1, color_primary: "#CE1126", color_secondary: "#003082", city: "Dover", state: "DE", arena_name: "Memorial Hall", arena_capacity: 3000 },
  { name: "Howard University", short_name: "Howard", abbreviation: "HOW", conference: "MEAC", prestige: 2, color_primary: "#003A86", color_secondary: "#FFFFFF", city: "Washington", state: "DC", arena_name: "Burr Gymnasium", arena_capacity: 2700 },
  { name: "Maryland Eastern Shore University", short_name: "Maryland Eastern Shore", abbreviation: "MDES", conference: "MEAC", prestige: 1, color_primary: "#CC0000", color_secondary: "#003082", city: "Princess Anne", state: "MD", arena_name: "William P. Hytche Athletic Center", arena_capacity: 3000 },
  { name: "Morgan State University", short_name: "Morgan State", abbreviation: "MGST", conference: "MEAC", prestige: 1, color_primary: "#F47C20", color_secondary: "#003082", city: "Baltimore", state: "MD", arena_name: "Hill Field House", arena_capacity: 4000 },
  { name: "Norfolk State University", short_name: "Norfolk State", abbreviation: "NFST", conference: "MEAC", prestige: 1, color_primary: "#007F3E", color_secondary: "#FFD100", city: "Norfolk", state: "VA", arena_name: "Echols Hall", arena_capacity: 7800 },
  { name: "North Carolina A&T University", short_name: "NC A&T", abbreviation: "NCAT", conference: "MEAC", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Greensboro", state: "NC", arena_name: "Corbett Sports Center", arena_capacity: 7500 },
  { name: "North Carolina Central University", short_name: "NC Central", abbreviation: "NCCU", conference: "MEAC", prestige: 1, color_primary: "#990000", color_secondary: "#B09356", city: "Durham", state: "NC", arena_name: "McDougald-McLendon Arena", arena_capacity: 2800 },
  { name: "South Carolina State University", short_name: "SC State", abbreviation: "SCST", conference: "MEAC", prestige: 1, color_primary: "#B22222", color_secondary: "#004B8D", city: "Orangeburg", state: "SC", arena_name: "Smith-Hammond-Middleton Memorial Center", arena_capacity: 3200 },

  // ────────────────────────────────────────────
  // NEC (10)
  // ────────────────────────────────────────────
  { name: "Bryant University", short_name: "Bryant", abbreviation: "BRY", conference: "NEC", prestige: 1, color_primary: "#000000", color_secondary: "#B89B5E", city: "Smithfield", state: "RI", arena_name: "Chace Athletic Center", arena_capacity: 2000 },
  { name: "Central Connecticut State University", short_name: "Central Connecticut", abbreviation: "CCSU", conference: "NEC", prestige: 1, color_primary: "#003082", color_secondary: "#FFFFFF", city: "New Britain", state: "CT", arena_name: "Kaiser Hall", arena_capacity: 3200 },
  { name: "Fairleigh Dickinson University", short_name: "Fairleigh Dickinson", abbreviation: "FDU", conference: "NEC", prestige: 1, color_primary: "#003082", color_secondary: "#CC0000", city: "Teaneck", state: "NJ", arena_name: "Rothman Center", arena_capacity: 5000 },
  { name: "LIU Post", short_name: "LIU", abbreviation: "LIU", conference: "NEC", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Brookville", state: "NY", arena_name: "Steinberg Wellness Center", arena_capacity: 2000 },
  { name: "Merrimack College", short_name: "Merrimack", abbreviation: "MERR", conference: "NEC", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "North Andover", state: "MA", arena_name: "Hammel Court", arena_capacity: 1500 },
  { name: "Mount St. Mary's University", short_name: "Mount St. Mary's", abbreviation: "MSM", conference: "NEC", prestige: 1, color_primary: "#003082", color_secondary: "#C8A32A", city: "Emmitsburg", state: "MD", arena_name: "Knott Arena", arena_capacity: 3600 },
  { name: "Sacred Heart University", short_name: "Sacred Heart", abbreviation: "SHU", conference: "NEC", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Fairfield", state: "CT", arena_name: "William H. Pitt Center", arena_capacity: 2100 },
  { name: "Saint Francis University", short_name: "Saint Francis", abbreviation: "SFU", conference: "NEC", prestige: 1, color_primary: "#CC0000", color_secondary: "#FFFFFF", city: "Loretto", state: "PA", arena_name: "DeGol Arena", arena_capacity: 3500 },
  { name: "Saint Francis Brooklyn", short_name: "St. Francis Brooklyn", abbreviation: "SFB", conference: "NEC", prestige: 1, color_primary: "#003082", color_secondary: "#FFFFFF", city: "Brooklyn", state: "NY", arena_name: "Physical Education Center", arena_capacity: 1200 },
  { name: "Wagner College", short_name: "Wagner", abbreviation: "WAG", conference: "NEC", prestige: 1, color_primary: "#006633", color_secondary: "#FFFFFF", city: "Staten Island", state: "NY", arena_name: "Spiro Sports Center", arena_capacity: 1600 },

  // ────────────────────────────────────────────
  // OVC (8)
  // ────────────────────────────────────────────
  { name: "Belmont University", short_name: "Belmont", abbreviation: "BEL", conference: "Ohio Valley", prestige: 2, color_primary: "#CC0000", color_secondary: "#000000", city: "Nashville", state: "TN", arena_name: "Curb Event Center", arena_capacity: 5000 },
  { name: "Eastern Illinois University", short_name: "Eastern Illinois", abbreviation: "EIU", conference: "Ohio Valley", prestige: 1, color_primary: "#004B8D", color_secondary: "#C8A32A", city: "Charleston", state: "IL", arena_name: "Lantz Arena", arena_capacity: 5300 },
  { name: "Eastern Kentucky University", short_name: "Eastern Kentucky", abbreviation: "EKU", conference: "Ohio Valley", prestige: 1, color_primary: "#500000", color_secondary: "#888B8D", city: "Richmond", state: "KY", arena_name: "McBrayer Arena", arena_capacity: 6500 },
  { name: "Jacksonville State University", short_name: "Jacksonville State", abbreviation: "JVST", conference: "Ohio Valley", prestige: 1, color_primary: "#CC0000", color_secondary: "#000000", city: "Jacksonville", state: "AL", arena_name: "Pete Mathews Coliseum", arena_capacity: 5500 },
  { name: "Morehead State University", short_name: "Morehead State", abbreviation: "MRST", conference: "Ohio Valley", prestige: 1, color_primary: "#003082", color_secondary: "#FFD100", city: "Morehead", state: "KY", arena_name: "Johnson Arena", arena_capacity: 6500 },
  { name: "Southeast Missouri State University", short_name: "Southeast Missouri", abbreviation: "SEMO", conference: "Ohio Valley", prestige: 1, color_primary: "#990000", color_secondary: "#FFFFFF", city: "Cape Girardeau", state: "MO", arena_name: "Show Me Center", arena_capacity: 7000 },
  { name: "Tennessee State University", short_name: "Tennessee State", abbreviation: "TNST", conference: "Ohio Valley", prestige: 1, color_primary: "#003082", color_secondary: "#FFFFFF", city: "Nashville", state: "TN", arena_name: "Gentry Center", arena_capacity: 10500 },
  { name: "Tennessee Tech University", short_name: "Tennessee Tech", abbreviation: "TNTU", conference: "Ohio Valley", prestige: 1, color_primary: "#4B2F83", color_secondary: "#FFD100", city: "Cookeville", state: "TN", arena_name: "Hooper Eblen Center", arena_capacity: 10152 },
];

// Get unique conferences
export const CONFERENCES = [...new Set(D1_SCHOOLS.map(s => s.conference))].sort();

// Get schools by conference
export function getSchoolsByConference(conference: string): D1School[] {
  return D1_SCHOOLS.filter(s => s.conference === conference);
}

// Get school by name
export function getSchoolByName(name: string): D1School | undefined {
  return D1_SCHOOLS.find(s => s.name === name || s.short_name === name || s.abbreviation === name);
}

export default D1_SCHOOLS;
