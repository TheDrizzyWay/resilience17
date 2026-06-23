GetProductsRequest {
  path /creator-cards/:slug
  method GET
  
  params {
	slug string<trim|lowercase|lengthBetween:5,50>
  }

  query {
    access_code? string<length:6>
  }
  
  response.ok {
    http.code 200
    status successful
    message "Creator Card Retrieved Successfully."
    data {
        id string
        title string
        description? string
        slug string
        creator_reference string
        links[] {
          title string
          url string
        }
        service_rates? {
          currency string
          rates[] {
            name string
            amount number
            description? string
          }
        }
        status string
        access_type string
        created number
        updated number
    }
  }
  
  response.error {
    http.code 400
    status error
    message "Invalid query parameters"
    data {
      errors[] {
        field string
        message string
        code string
      }
    }
  }
}
