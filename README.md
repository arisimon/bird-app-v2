# Bird Observation Journal
This is my Thinkful Node Capstone project, the Bird Observation Journal. 
This application allowers user to track the birds that they see, entering in the taxonomic information as well as 
the location and relevant notes for the observation. 
Users can also utilize a search via the bird's common name for taxonomic information and related species to that species.


## Motivation
When I lived abroad doing field research in Costa Rica, I became an avid birder. 
I decided I wanted an easy way to be able to keep track of the birds that I saw as well as record all the 
information about that observation. I also love learning about the different bird species so I wanted a way
to search for the taxonomic information of the birds as well as see the related species of those birds.

## Live Demo
[https://limitless-headland-10314.herokuapp.com/]

## Functionality
Within this application, users can:
* Add a new observation with the following information
  *  Scientific Name
  *  Common Name
  *  Family Name
  *  Location
  *  Photos
  *  Notes
* Update their observation
* Delete their observation
* Complete a fuzzy search via a bird's common name to display taxonomic information and related species 

## Technology
### Front End
* HTML
* CSS
* JavaScript
* jQuery

### Back End
* Node.js
* Express
* Mocha
* Chai
* Mongo
* Mongoose
* bcryptjs
* Passport
* Heroku
* TravisCI
* mLab

## Responsive Design
This app is built to be responsive across mobile, tablet, laptop, and desktop screens.

## Development
### Future updates are expected to include:
* Add Google Maps to allow for mapping of the locations of user observations
* Add third-party API to show the other bird observations around the user's location
* Add more functionality to the species search to allow for scientific name or family queries
