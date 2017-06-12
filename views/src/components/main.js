import React, { Component } from 'react';
import ListView from '../containers/list_view';
import ListItem from '../containers/list_item';

class Main extends Component {
    submit() {
        fetch('http://localhost:3000/homeworks', {
            method: 'POST',
            body: JSON.stringify({
                url: 'https://github.com/gpincheiraa/workshop2016-nodeconfar-angular'
            }),
            headers: new Headers({
        		'Content-Type': 'application/json'
        	})
        })
    }
    render() {
        return(
            <div className="col-md-10 col-md-offset-1 main">
                <ListView />
                <ListItem />
                <button onClick={this.submit}>Enviar</button>
            </div>
        )
    }
}

export default Main;
