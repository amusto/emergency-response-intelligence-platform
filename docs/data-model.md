# Data Model

## Facility
Types:
- Hospital
- Emergency Room
- Clinic

Fields:
- id
- name
- type
- status
- latitude
- longitude

## Resource
Types:
- EMS
- Fire
- Police

Fields:
- id
- unitNumber
- type
- status
- latitude
- longitude

## Incident
Types:
- Medical Emergency
- Traffic Accident
- Structure Fire

Fields:
- id
- priority
- status
- location
- description
