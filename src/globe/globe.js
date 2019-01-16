/*
 * The following code is copied from/heavily inspired by:
 * https://codepen.io/Flamov/pen/MozgXb
 */
import React, { Component } from 'react';

import * as THREE from 'three';
import * as OrbitControlsFactory from 'three-orbit-controls';

import $ from "jquery";

import './globe.css';

// window.THREE = THREE;

var OrbitControls = OrbitControlsFactory(THREE);

var easeInOutQuad = function(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};



class Globe extends Component {

    static defaultProps = {
        animate: true,
        central_point: {
            // Utrecht
            lat: 5.1214,
            lon: 52.0907
        },
        altitude: 2.0,
        connection_line_width: 2,
        connection_line_color: 0xff0000,
        nr_of_dots: 5,
        dot_radius: 0.004,
        dot_color: 0xffffff,
        nodes: {}
    }

    constructor(props) {
        super(props);
        this.scale = 100;
        this.globeRadius = 0.5;

        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        this.vertices = null;
        this.animations = {
            camera: {
                animating: false,
                frame_index: 0,
                total_frames: 120,
                origin: null,
                target: null                
            }
        };
        this.counter = 0;

        this.render_frame = this.render_frame.bind(this);
        this.animateMoveCameraOver = this.animateMoveCameraOver.bind(this);
        this.moveCameraOver = this.moveCameraOver.bind(this);
        this.startCameraTransition = this.startCameraTransition.bind(this);
    }

    componentDidMount() {
        this.createGlobe();
        this.createConnections();
        this.startCameraTransition();
    }

    createGlobe() {
        var { 
            central_point,
            altitude
        } = this.props;

        const width = $('#globe').width();
        const height = $('#globe').height();
        var webglElement = document.getElementById('globe');

        var segments = 32;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        var cc = this.returnSphericalCoordinates(
            central_point.lat, 
            central_point.lon, 
            altitude
        );
        camera.position.set(cc.x, cc.y, cc.z);

        camera.lookAt( 0, 0, 0 );

        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor('#000000', 0);

        createLight();

        var sphere = createSphere(this.globeRadius, segments);
        scene.add(sphere);

        var clouds = createClouds(this.globeRadius, segments);
        scene.add(clouds);

        var controls = createControls();

        webglElement.appendChild(renderer.domElement);

        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.controls = controls;
        this.clouds = clouds;

        this.connections = {};

        this.render_frame();

        function createAxesHelper() {
            // The X axis is red. 
            // The Y axis is green. 
            // The Z axis is blue.
            scene.add( new THREE.AxesHelper( 20 ) );
        }

        function createControls() {
            var controls = new OrbitControls(camera, renderer.domElement );
            controls.minDistance = 0.7;
            controls.maxDistance = 25;
            controls.maxPolarAngle = Math.PI / 2;

            return controls;
        }

        function createSphere(radius, segments) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius, segments, segments),
                new THREE.MeshPhongMaterial({
                    map: THREE.ImageUtils.loadTexture('/img/2_no_clouds_4k.jpg')
                })
            );
        }

        function createClouds(radius, segments) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius + 0.003, segments, segments),     
                new THREE.MeshPhongMaterial({
                    map:         THREE.ImageUtils.loadTexture('/img/fair_clouds_4k.png'),
                    transparent: true
                })
            );    
        }

        function createLight() {
            scene.add(new THREE.AmbientLight(0x555555));

            var light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5,3,5);
            scene.add(light);
        }
    }

    createConnections() {
        var { 
            central_point,
            nodes,
            connection_line_width,
            connection_line_color,
            nr_of_dots,
            dot_radius,
            dot_color
         } = this.props;

        var lines = new THREE.Group();

        // Create a white LineBasicMaterial
        var material = new THREE.LineBasicMaterial( {
            linewidth: connection_line_width, 
            color: connection_line_color
        });

        // Create a spline between the central point and each node
        for (var key in nodes) {
            var connection = {};
            var node = nodes[key];
            connection.node = node;

            var result = this.returnCurveCoordinates(
                central_point.lat, central_point.lon,
                node.lat, node.lon
            );

            var curve = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(result.start.x, result.start.y, result.start.z),
                new THREE.Vector3(result.mid.x, result.mid.y, result.mid.z),
                new THREE.Vector3(result.end.x, result.end.y, result.end.z)
            );

            var distance = this.getDistance(result.start, result.end);
            var geometry = new THREE.Geometry();
            var nr_of_vertices = Math.floor(100*distance + 200);
            geometry.vertices = curve.getPoints(nr_of_vertices);
            connection.vertices = geometry.vertices;

            var line = new THREE.Line( geometry, material );
            lines.add(line);
            connection.line = line;

            var g = new THREE.SphereGeometry(dot_radius, 32, 32);
            var m = new THREE.MeshBasicMaterial( {color: dot_color} );
            var coords = this.returnSphericalCoordinates(node.lat, node.lon);

            connection.dots = [];
            for (var i=0; i < nr_of_dots; i++) {
                var dot = new THREE.Mesh(g, m);
                dot.offset = Math.floor(i * (nr_of_vertices / nr_of_dots));
                Object.assign(dot, coords);
                this.scene.add(dot);

                connection.dots.push(dot);
            }

            this.connections[key] = connection;
        }

        // Make sure these lines get rendered.
        this.scene.add(lines);
    }


    getMidpoint(start, end) {
        return {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
            z: (start.z + end.z) / 2
        };
    }

    getDistance(start, end) {
        var distance = Math.pow(end.x - start.x, 2);
        distance += Math.pow(end.y - start.y, 2);
        distance += Math.pow(end.z - start.z, 2);
        distance = Math.sqrt(distance);

        return distance;
    }

    getIntersection(start, end) {
    }

    /*
    animateCamera(idx=0) {
        var {
            nodes,
            animate
        } = this.props;

        var origin = new THREE.Spherical();
        origin.setFromCartesianCoords(1, 1, 1);
        console.log(origin);

        var node_keys = Object.keys(nodes);
        var nr_of_nodes = node_keys.length;
        idx = idx % nr_of_nodes;

        var node = nodes[node_keys[idx]];
        console.log('moving camera over {}'.format(node_keys[idx]));
        this.moveCameraOver(node.lat, node.lon);

        if (animate) {
            setTimeout(() => {
                this.animateCamera(idx+1)
            }, 5000);
        }
    }
    */

    startCameraTransition(idx=0) {
        this.animations.camera.frame_index = 0;

        var {
            nodes,
            animate,
            altitude
        } = this.props;
        var { camera } = this.animations;

        // console.log(camera, nodes);

        var node_keys = Object.keys(nodes);
        var nr_of_nodes = node_keys.length;

        var origin_idx = idx % nr_of_nodes;
        var target_idx = (idx + 1) % nr_of_nodes;

        console.log(origin_idx, target_idx);
        var origin = nodes[node_keys[origin_idx]];
        var origin_coords = this.returnSphericalCoordinates(origin.lat, origin.lon, altitude);

        var target = nodes[node_keys[target_idx]];
        var target_coords = this.returnSphericalCoordinates(target.lat, target.lon, altitude);

        camera.origin = new THREE.Spherical().setFromCartesianCoords(
            origin_coords.x, 
            origin_coords.y, 
            origin_coords.z
        );

        camera.target = new THREE.Spherical().setFromCartesianCoords(
            target_coords.x, 
            target_coords.y, 
            target_coords.z
        );

        console.log('origin, target: ', origin, target);
        console.log('camera: ', camera.origin, camera.target);
        camera.animating = true;

        if (animate) {
            setTimeout(() => {
                this.startCameraTransition(idx+1)
            }, 10 * 1000);
        }        
    }

    animateMoveCameraOver() {
        var { camera } = this.animations;
        var {
            animating,
            frame_index,
            total_frames
        } = this.animations.camera;

        if (!animating) {
            return;
        }

        var progress = easeInOutQuad(frame_index / total_frames);

        var theta_delta = (camera.origin.theta - camera.target.theta);
        // console.log('theta_delta: {}'.format(theta_delta));

        if (theta_delta > Math.PI) {
            theta_delta = -(2*Math.PI - theta_delta);
            // console.log('2*PI - theta_delta: {}'.format(theta_delta));
        } else if (theta_delta < -Math.PI) {
            theta_delta = (2*Math.PI + theta_delta);
            // console.log('-(2*PI + theta_delta): {}'.format(theta_delta));
        } 

        theta_delta = theta_delta * progress;
        var theta = camera.origin.theta - theta_delta;

        var phi_delta = (camera.origin.phi - camera.target.phi);
        phi_delta = phi_delta * progress;
        var phi = camera.origin.phi - phi_delta;

        // Get the camera_position to obtain current altitude
        var camera_position = new THREE.Spherical().setFromCartesianCoords(
            this.camera.position.x, 
            this.camera.position.y, 
            this.camera.position.z
        );

        var point = new THREE.Vector3().setFromSphericalCoords(
            camera_position.radius,
            phi,
            theta
        );

        this.camera.position.set(
            point.x,
            point.y,
            point.z
        );

        this.animations.camera.frame_index++;

        if (frame_index >= total_frames) {
            this.animations.camera.animating = false;
            this.animations.camera.frame_index = 0;
        }
    }

    moveCameraOver(lat, lon, altitude=null) {
        if (!altitude) {
            altitude = this.props.altitude;
        }

        var coords = this.returnSphericalCoordinates(lat, lon, altitude);
        Object.assign(this.camera.position, coords);
    }


    returnCurveCoordinates(latitudeA, longitudeA, latitudeB, longitudeB) {
        // Reference: https://codepen.io/ya7gisa0/pen/pisrm?editors=0010
        // Calculate the starting point
        var start = this.returnSphericalCoordinates(latitudeA, longitudeA);

        // Calculate the end point
        var end = this.returnSphericalCoordinates(latitudeB, longitudeB);

        // Calculate the mid-point
        var midpoint = this.getMidpoint(start, end);

        // Calculate the distance between the two coordinates
        var distance = this.getDistance(start, end);

        // Calculate the multiplication value
        var multipleVal = Math.pow(midpoint.x, 2);
        multipleVal += Math.pow(midpoint.y, 2);
        multipleVal += Math.pow(midpoint.z, 2);
        multipleVal = Math.pow(distance/1.2, 2) / multipleVal;
        multipleVal = multipleVal * 0.7 + 0.05;

        // Apply the vector length to get new mid-points
        var midX = midpoint.x + multipleVal * midpoint.x;
        var midY = midpoint.y + multipleVal * midpoint.y;
        var midZ = midpoint.z + multipleVal * midpoint.z;

        // Return set of coordinates
        return {
            start: {
                x: start.x,
                y: start.y,
                z: start.z
            },
            mid: {
                x: midX,
                y: midY,
                z: midZ
            },
            end: {
                x: end.x,
                y: end.y,
                z: end.z
            }
        };
    }

    returnSphericalCoordinates(latitude, longitude, altitude=null) {
        // latitude: EAST - WEST; [-180, 180]
        // longitude: NORTH - SOUTH; [-90, 90]
        function rad(deg) {
            return deg * (Math.PI/180);
        }

        if (!altitude) {
            altitude = this.globeRadius;
        }

        var targetY = Math.sin(rad(longitude)) * altitude;
        var radiusAtY = Math.cos(rad(longitude)) * altitude;

        var targetX = Math.cos(rad(latitude)) * radiusAtY;
        var targetZ = -Math.sin(rad(latitude) ) * radiusAtY;

        var retval = {
            x: targetX,
            y: targetY,
            z: targetZ
        };

        // console.log(
        //     'lat/lon:', 
        //     {lat: latitude, lon: longitude}, 
        //     {lat: rad(latitude), lon: rad(longitude)}
        // );
        // console.log('radiusAtY:', radiusAtY);
        // console.log('retval:', retval);

        return retval;
    }

    renderDots() {
        if (Object.keys(this.connections) == 0) {
            return;
        }

        for (var key in this.connections) {
            if (this.counter == 0) {
                console.log('key: ', key, this.connections[key]);
            }

            var node = this.connections[key];
            var nr_of_vertices = node.vertices.length - 1;

            for (var i=0; i < node.dots.length; i++) {
                var idx =  (this.counter - node.dots[i].offset) % nr_of_vertices;
                var pos = node.vertices[nr_of_vertices - idx];
                Object.assign(node.dots[i].position, pos);
            }
        }

        this.counter = (this.counter + 1) % 200000000;
    }

    render_frame() {
        if (!this.props.animate){
            return;
        }

        // Process user input
        this.controls.update();

        // Rotate the clouds
        if (this.clouds) {
            this.clouds.rotation.y += 0.0001;                
        }

        this.renderDots();
        this.animateMoveCameraOver()

        // Render the scene
        this.renderer.render(this.scene, this.camera);

        // Make sure we get to render the next frame as well ...
        requestAnimationFrame(this.render_frame);
    }



    render() {
        console.log("**** RENDERING ****");
        if (this.props.animate && this.scene) {
            // console.log("restarting rendering ...");
            this.render_frame();
            this.startCameraTransition();
        }

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