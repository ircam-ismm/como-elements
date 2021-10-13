# `como-elements`

## Install

#### First time after cloning the project
`npm install` 

If case of changes in node modules: `rm -rf node_modules` and then `npm install`

#### Running
`npm run dev`  (transpiling and running checking for changes)

or

`npm run build` once and then `npm run start` (faster if the code hasn't changed)



#### https certificates
Secure https is necessary to use sensors over webpages with iOS, and set on by default. Certificates matching the DNS name must be added to a folder `/certs` (not in this repository). See `/config/env/default.json` for changing default.


## Projects and Sessions

### You can create different `projects` with different audio files and scripts, strored in the folder `/projects`.
Each projects can have different `sessions` with specfic gestures and a selection of the audio files. 
The project `default` is here to facilitate initial testing of the application. We strongly advise to duplicate it and start you own project.

The project loaded by the application is set in `/config/project-default.json`

**Basic project structure**: 

- **project_A** with a set of audio files stored in `/projects/project_A/audio`
  - **session_A1** with a specific gestures set
  - **session_A2** with another specific gestures set
  - **session_A3** with yet another specific gestures set...

- **project_B**
  - **session_B1**
  - **session_B2**
etc.


## Clients and Controller

Each devices connects to the server opening a webpage. Different type of clients can be used

#### Device with motion sensors (smartphone, tablet)
- **`designer`**, using `https://myserver:8000/designer` allows for recording gesture template to be recognized, each linked to specific sound
- **`player`**, using `https://myserver:8000/` allows for playing  gesture template to be recognized, playing the corresponding sound

####  Device with or without motion sensors, preferably with a big screen
- **`controller`** using `https://myserver:8000/controller` for managing in real-time all connected devices and run different session and scripts.
On the comptuer running the node server, you can use `https://127.0.0.1:8000/controller`

The default port is 8000, other port value can be set in `/config/env/default.json`

## Audio and Data Scripts

Data processing and sound sunthesis can be set using scripts in each projects, see in folder `/projects/script`
Find below some examples:

in `/projects/script/audio`
- `synth-likeliest-loop.js`audio samples are selected according to the "likeliest" gesture return by the recognizer. The playing is looped, but this can be changed in the script.
- `fx-gain-energy.js` enables to vary the audio intensity according to the gestures "energy" (computed from the accelerometers)


## To faciliate testing and development purpose

### To test client on a laptop

```
https://127.0.0.1:8000/#mock-sensors
```

### emulate several clients at once

```
https://127.0.0.1:8000/?emulate=4#mock-sensors
```

### Invalid certificates in chrome

for development purpose, you might allow invalid certificates in chrome:

```
chrome://flags/#allow-insecure-localhost
```

## License

BSD-3-Clause

## Full credits and Acknowledgements
### Research and Development: 
Benjamin Matuszweski (main developer), Joseph Larralde, Jean-Philippe Lambert, Frederic Bevilacqua (coordination)
It includes the XMM library developed by Jules Françoise and Soundworks-V2 by Benjamin Matuszweski

### References
- Matuszewski, B., Larralde, J., & Bevilacqua, F. (2018, September). Designing movement driven audio applications using a web-based interactive machine learning toolkit. In Web Audio Conference (WAC). https://hal.archives-ouvertes.fr/hal-01874966/document
- Matuszewski, B., Systèmes musicaux distribués et technologies Web - Motivations, design et implémentation d’un système expérimental. PhD thesis. UNiverstiy Paris 8. 2020.


### Acknowledgments
The CoMo ecosystem was initiated within the framework of the RAPID-MIX project, an Innovation Action funded by the European Commision (H2020-ICT-2014-1 Project ID 644862). Current supports include the ELEMENT project (ANR-18-CE33-0002). It uses the Collective Soundworks framework developed in the CoSiMa project (ANR-13-CORD-0010), developed by Benjamin Matuszweski, Norbert Schnell and Sébastien Robaszkiewicz and Waves libraries developed in the Wave project (ANR-12-CORD-0027).
Audio files in the default application by Roland Cahen, Andrea Cera, Olivier Houix, Jan Schacher.
Special thanks to: Anne Dubos, Bertha Bermudez, Michelle Agnes Magalhaes and Marion Voillot
