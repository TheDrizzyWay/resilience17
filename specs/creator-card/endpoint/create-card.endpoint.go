CreateCreatorCardRequest {
  path /creator-cards
  method POST
  
  body {
    title string<trim|minLength:3|maxLength:100>
    description? string<trim|maxLength:500>
    slug string<trim|lowercase|lengthBetween:5,50>
    creator_reference string<trim|length:20>
    links[]? {
      title string<trim>
      url string<trim|maxLength:200>
    }
    service_rates? {
      currency string<trim>
      rates[] {
        name string<trim|lengthBetween:3,100>
        amount number
        description? string<trim|maxLength:250>
      }
    }
    status string(draft|published)
    access_type? string(private|public)
    access_code? string<trim|length:6>
  }

  response.ok {
    http.code 200
    status successful
    message "Creator card created successfully"
    data {
      creator_card {
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
        access_code? string
        created number
        updated number
      }
    }
  }
  
  response.error {
    http.code 400
    status error
    message "Validation failed"
    data {
      errors[] {
        field string
        message string
        code string
      }
    }
  }
}
