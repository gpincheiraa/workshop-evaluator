import express from 'express';
import React from 'react';
import fs from 'fs'
import ReactDOMServer from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from '../views/src/routes';
import reducers from '../views/src/reducers/index';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ADD_ITEM } from '../views/src/actions/list_actions';
import commandLine from '../helpers/commandLine'

let router = express.Router();

//En mi opinión, las lógicas de cada ruta deben ser cambiadas a un controller
router.post('/homeworks', async (req, res) => {
    try {
        //1. Ejecutar comando de evaluación
        console.log('Executing the evaluation script. Take a while ...')

        const result = await commandLine(req.body)
        console.log('stdout: ', result.stdout)
        console.log('stderr: ', result.stderr)

        //2. Leer archivo generado por el evaluador
        const testsResults = fs.readFileSync('./scripts/evaluation.json', 'utf8')
        console.log(testsResults)

        //3. Calcular los resultados y la evaluación del alumnos
        // Reglas:
        // Si el usuario ya tiene datos sobre su desempeño ágil de la evaluación
        // (estos se obtendrán de la api rest donde persistiran los datos), se calculará
        // la nota final de inmediato, junto con el resultado en los puntos
        // evaluados tanto técnicamente como en la parte ágil
        // En caso contrario, se le informa al usuario el resultado técnico
        // y se le deja en espera a ser notificado por mail que reingrese al sistema a ver
        // su resultado.
        // El resultado técnico debe guardarse en la base de datos

        //Para los efectos de que el usuario pueda revisar sus resultados, habilitaremos
        //una vista en una ruta de esta app donde el usuario podrá, ingresando su rut
        //ver la información de la evaluación del grupo al que pertenece

        //enviar payload de la evaluación
        res.status(200).send(testsResults);
    } catch (e) {
        console.log(`ERROR: ${e.message}`)

        //1. Formatear error según procedencia de este
        //2. Enviar mensaje a usuario para que vuelva a reintentar
        res.status(500).send(e.message)
    }


})

router.get('/', (req, res) => {
    /*
    Here we are first matching if the current url exists in the react router routes
     */
	match({ routes, location: req.originalUrl }, (error, redirectLocation, renderProps) => {
		if (error) {
			res.status(500).send(error.message)
		} else if (redirectLocation) {
			res.redirect(302, redirectLocation.pathname + redirectLocation.search)
		} else if (renderProps) {

		    /*
             http://redux.js.org/docs/recipes/ServerRendering.html
		     */
			const store = createStore(reducers);

			const html = ReactDOMServer.renderToString(
				<Provider store={store}>
					<RouterContext {...renderProps} />
				</Provider>
			);

			/*
			We can dispatch actions from server side as well. This can be very useful if you want
			to inject some initial data into the app. For example, if you have some articles that
			you have fetched from database and you want to load immediately after the user has loaded
			the webpage, you can do so in here.

			Here we are inject an list item into our app. Normally once the user has loaded the webpage
			we would make a request to the server and get the latest item list. But in the server we have
			instant connection to a database (for example, if you have a mongoDB or MySQL database installed
			in the server which contains all you items). So you can quickly fetch and inject it into the webpage.

			This will help SEO as well. If you load the webpage and make a request to the server to get all the
			latest items/articles, by the time Google Search Engine may not see all the updated items/articles.

			But if you inject the latest items/articles before it reaches the user, the Search Engine will see the
			item/article immediately.
			 */
			store.dispatch({
			    type: ADD_ITEM,
                payload: {
			        name: 'Components',
                    description: 'Description for components'
                }
            });

			const finalState = store.getState();

			res.status(200).send(renderFullPage(html, finalState));
		} else {
			res.status(404).send('Not found')
		}
	})
});


/*
In this function, you can render you html part of the webpage. You can add some meta tags or Opern Graph tags
using JS variables.
 */
function renderFullPage(html, initialState) {
	return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    	<!-- Required meta tags always come first -->
    	<meta charset="utf-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    	<meta http-equiv="x-ua-compatible" content="ie=edge">
    	<title>React Router Redux Express</title>

    	<!-- Bootstrap CSS -->
    	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/css/bootstrap.min.css" integrity="sha384-y3tfxAZXuh4HwSYylfB+J125MxIs6mR5FOHamPBG064zB+AFeWH94NdvaCBm8qnd" crossorigin="anonymous">
    	<link rel="stylesheet" href="../stylesheets/main.css">
    </head>
    <body>

    	<div id="reactbody"><div>${html}</div></div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
          </script>
    	<script src="../bin/app.bundle.js"></script>
    	<!-- jQuery first, then Bootstrap JS. -->
    	<script src="https://www.atlasestateagents.co.uk/javascript/tether.min.js"></script>
    	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.2/js/bootstrap.min.js" integrity="sha384-vZ2WRJMwsjRMW/8U7i6PWi6AlO1L79snBrmgiDpgIWJ82z8eA5lenwvxbMV1PAh7" crossorigin="anonymous"></script>
    </body>
    </html>
    `
}

export default router;
