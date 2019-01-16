/*
 * The following code is copied from/heavily inspired by:
 * https://codepen.io/Flamov/pen/MozgXb
 */
import React, { Component } from 'react';

import * as THREE from 'three';
import * as ENCOM_Globe from 'encom-globe/src/Globe';
// import * as ENCOM_Globe from './encom/Globe';
// import './encom-globe.js';

// import * as OrbitControlsFactory from 'three-orbit-controls';
// import { MeshLine, MeshLineMaterial } from 'three.meshline';

import $ from "jquery";

import grid from './encom-grid.json';
import './globe.css';

class Globe extends Component {

    componentDidMount() {
        this.renderEncomGlobe();
    }

    renderEncomGlobe() {
        const width = $('#globe').width();
        const height = $('#globe').height();

        var globe = new ENCOM_Globe(width, height, {
            font: "monaco",
            // data: data.slice(), 
            tiles: grid.tiles,
            baseColor: 'cyan',
            markerColor: 'yellow',
            pinColor: 'cyan',
            satelliteColor: 'orange',
            scale: 1.1,
            dayLength: 1000 * 30,
            introLinesDuration: 2000,
            maxPins: 500,
            maxMarkers: 500,
            viewAngle: 0.8
        });

        $("#globe").append(globe.domElement);
        globe.init(start);
        globe.renderer.setClearColor('#000000', 0);
        // globe.renderer.setPixelRatio(window.devicePixelRatio);

        function animate() {
            if (globe) {
                globe.tick();
            }

            requestAnimationFrame(animate);
        }

        function start(){
            animate();

            /* add the connected points that are in the movie */
            setTimeout(function(){
                var iknl_marker = globe.addMarker(52.3680, 4.9036, "IKNL", true, 1.1);
                globe.addPin(52.3680, 4.9036, "", 1.1).hideSmoke();

                var palga_marker = globe.addMarker(52.0030, 5.1858, "PALGA", iknl_marker, 1.3);
                globe.addPin(52.0030, 5.1858, "", 1.3).hideSmoke();

                var tcr_marker = globe.addMarker(23.6978, 120.9605, "Taiwan Cancer Registry", iknl_marker);
                globe.addPin(23.6978, 120.9605, "").hideSmoke();

                var ucsc_marker = globe.addMarker(41.9028, 12.4964, "UCSC, Rome", iknl_marker);
                globe.addPin(41.9028, 12.4964, "").hideSmoke();
            }, 2000);
        }
    }

    renderGlobe() {
        // Parameters
        const width = $('#globe').width();
        const height = $('#globe').height();
        var webglEl = document.getElementById('globe');

        var radius = 0.5,
            segments = 32,
            rotation = 6;  

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        camera.position.z = 1.5;

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        scene.add(new THREE.AmbientLight(0x333333));

        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5,3,5);
        scene.add(light);

        var sphere = createSphere(radius, segments);
        sphere.rotation.y = rotation; 
        scene.add(sphere);

        webglEl.appendChild(renderer.domElement);
        render_frame();

        function render_frame() {
            // controls.update();
            sphere.rotation.y += 0.0015;
            // clouds.rotation.y += 0.0005;    
            requestAnimationFrame(render_frame);
            renderer.render(scene, camera);
        }

        function createSphere(radius, segments) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius, segments, segments),
                new THREE.MeshPhongMaterial({
                    // map:         THREE.ImageUtils.loadTexture('img/map_outline.png')
                    map:         THREE.ImageUtils.loadTexture('img/2_no_clouds_4k.jpg')
                    // bumpMap:     THREE.ImageUtils.loadTexture('img/elev_bump_4k.jpg'),
                    // bumpScale:   0.005,
                    // specularMap: THREE.ImageUtils.loadTexture('img/water_4k.png'),
                    // specular:    new THREE.Color('grey')                
              })
            );
        }

        function createClouds(radius, segments) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius + 0.003, segments, segments),     
                new THREE.MeshPhongMaterial({
                    map:         THREE.ImageUtils.loadTexture('img/fair_clouds_4k.png'),
                    transparent: true
                })
            );    
        }

        function createStars(radius, segments) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius, segments, segments), 
                new THREE.MeshBasicMaterial({
                    map:  THREE.ImageUtils.loadTexture('img/galaxy_starfield.png'), 
                    side: THREE.BackSide
                })
            );
        }        
    }

    render() {
        console.log("**** RENDERING ****");
        return (
            <div className="Globe">
                <div id="globe" />
            </div>
        );
    }
}

// Exports
export default Globe;
export {
    Globe
};