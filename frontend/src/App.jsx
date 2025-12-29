import { useState, useEffect } from 'react'
import personService from './services/persons.js'

const Filter = (props) => {
  return (
    <div>
      filter shown with <input value={props.filter} onChange={props.eventHandle}/>
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <div>
      <form onSubmit={props.addPerson}>
        <div>
          name: <input value={props.name} onChange={props.eventName}/>
        </div>
        <div>
          number: <input value={props.number} onChange={props.eventNumber}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  )
}

const Persons = (props) => {
  return (
    <div>
      {props.persons.map(person =>
        <div key={person.id}>
          <Person name={person.name} number={person.number} delete={() => props.delete(person.id, person.name)}/>
        </div>
      )}
    </div>
  )
}

const Person = (props) => {
  return (
    <div>
      {props.name} {props.number}
      <button onClick={props.delete}>delete</button>
    </div>
  )
}

const Notification = (props) => {
  const notificationStyle = {
    color: props.errorMessage ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
  }

  if (props.message === null) {
    return null
  }

  return (
    <div style={notificationStyle}>
      {props.message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(false)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    if (persons.some(person => person.name === newName)) {
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const existingPerson = persons.find(person => person.name === newName )
        const updatedPerson = { ...existingPerson, number: newNumber }
        
        personService
          .update(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => 
              person.id !== existingPerson.id ? person : returnedPerson
            ))
            setMessage(
              `Changed number of ${newName}`
            )
            setNewName('')
            setNewNumber('')
            setTimeout(() => {
              setMessage(null)
            }, 5000)
          })
          .catch(error => {
            setErrorMessage(true)
            setMessage(
              `${error.response.data.error}`
            )
            setTimeout(() => {
              setMessage(null)
              setErrorMessage(false)
            }, 5000)
          })
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber
      }
      
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setMessage(
            `Added ${newName}`
          )
          setNewName('')
          setNewNumber('')
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(error => {
          setErrorMessage(true)
          setMessage(
            `${error.response.data.error}`
          )
          setTimeout(() => {
            setMessage(null)
            setErrorMessage(false)
          }, 5000)
      })
    }
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personService
        .deleteObject(id)
        .then(_returnedPerson => {
          setPersons(persons.filter(person => person.id !== id))
          setMessage(
            `${name} has been deleted`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(_error => {
          setErrorMessage(true)
          setMessage(
            `Information of ${name} has already been removed from the server`
          )
          setTimeout(() => {
            setMessage(null)
            setErrorMessage(false)
          }, 5000)
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  const personsToShow = newFilter
    ? persons.filter(person =>
      person.name.toLowerCase().includes(newFilter.toLowerCase())
    )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} errorMessage={errorMessage}/>
      <Filter filter={newFilter} eventHandle={handleFilterChange}/>
      <h3>add a new</h3>
      <PersonForm addPerson={addPerson} name={newName} eventName={handleNameChange} number={newNumber} eventNumber={handleNumberChange}/>
      <h3>Numbers</h3>
      <Persons persons={personsToShow} delete={deletePerson}/>
    </div>
  )
}

export default App