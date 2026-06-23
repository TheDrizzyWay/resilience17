import ../commons.go

CreatorCard {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  title string
  description? string
  slug string<isUnique|indexed>
  creator_reference string<isUnique|indexed> // Creator reference (e.g., user ID)
  links[]? { // Array of links
    title string
    url string
  }
  service_rates? {
    currency string // Currency code
    rates[] {
      name string
      amount number
      description? string
    }
  }
  status string // Status of the creator card (e.g., active, inactive)
  access_type string // Access type (e.g., public, private)
  access_code? string // Access code for private cards
  created number // Timestamp of creation
  updated number // Timestamp of last update
  deleted? number // Timestamp of soft deletion (if paranoid mode)
}
