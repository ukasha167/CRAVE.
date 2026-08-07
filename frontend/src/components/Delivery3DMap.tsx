import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Radius, Shadows } from '../constants/design';

interface Delivery3DMapProps {
  orderId?: string | number;
  initialDelivered?: boolean;
  onStatusChange?: (status: string) => void;
}

export default function Delivery3DMap({
  orderId,
  initialDelivered = false,
  onStatusChange,
}: Delivery3DMapProps) {
  const [telemetry, setTelemetry] = useState({
    distance: '1.4 KM',
    eta: '8 MIN',
    street: 'CRUISING ON CHESTNUT BLVD',
    speed: '22 KM/H',
    status: initialDelivered ? 'DELIVERED' : 'EN ROUTE',
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDelivered, setIsDelivered] = useState(initialDelivered);

  // Keep a stable ref to onStatusChange callback to avoid re-triggering effects
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (initialDelivered) {
      setIsDelivered(true);
    }
  }, [initialDelivered]);

  // Deterministically select a unique destination for this order (so it never resets on re-render)
  const destinationIndex = useMemo(() => {
    if (orderId !== undefined && orderId !== null) {
      const num = parseInt(String(orderId).replace(/\D/g, ''), 10);
      return isNaN(num) ? 0 : num % 8;
    }
    return 0;
  }, [orderId]);

  const htmlContent = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background-color: #FAF7F2; touch-action: none; }
    #canvas-container { width: 100%; height: 100%; position: absolute; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>
  <script>
    (function() {
      const isAlreadyDelivered = ${initialDelivered ? 'true' : 'false'};
      const destinationIndex = ${destinationIndex};

      const container = document.getElementById('canvas-container');
      const width = window.innerWidth;
      const height = window.innerHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xFAF7F2);
      scene.fog = new THREE.FogExp2(0xFAF7F2, 0.015);

      const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
      camera.position.set(24, 26, 24);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xFFF9EE, 0.85);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xFFF5E4, 0.9);
      dirLight.position.set(40, 60, 30);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 150;
      dirLight.shadow.camera.left = -50;
      dirLight.shadow.camera.right = 50;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = -50;
      scene.add(dirLight);

      const hemisphereLight = new THREE.HemisphereLight(0xFDFBF7, 0xD7CFC7, 0.4);
      scene.add(hemisphereLight);

      // Materials
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x2A2E35, roughness: 0.8, flatShading: true });
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xE4DED5, roughness: 0.9, flatShading: true });
      const groundMat = new THREE.MeshStandardMaterial({ color: 0xF2ECE2, roughness: 1.0 });
      
      const buildingColors = [0xEDE8DF, 0xE2DDD3, 0xD8D2C5, 0xF5F2EB, 0xCCC6B8];
      const accentMat = new THREE.MeshStandardMaterial({ color: 0xC45D4A, roughness: 0.4, flatShading: true }); // CRAVE Terracotta
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1A1C20, roughness: 0.5, flatShading: true });
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x8E959F, roughness: 0.3, metalness: 0.7, flatShading: true });
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x6E7B8B, roughness: 0.2, metalness: 0.8, flatShading: true });
      const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6D4C41, roughness: 0.9, flatShading: true });
      const treeLeafMat1 = new THREE.MeshStandardMaterial({ color: 0x4A7C59, roughness: 0.8, flatShading: true });
      const treeLeafMat2 = new THREE.MeshStandardMaterial({ color: 0x5B8E68, roughness: 0.8, flatShading: true });

      // Ground
      const groundGeo = new THREE.PlaneGeometry(200, 200);
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.05;
      ground.receiveShadow = true;
      scene.add(ground);

      // Grid Roads at X = [-30, -10, 10, 30] and Z = [-30, -10, 10, 30]
      const roadCoords = [-30, -10, 10, 30];
      const roadWidth = 6;
      const blockWidth = 14;

      const streetNames = {
        'H_-30': 'NORTH EMBASSY AVE',
        'H_-10': '2ND METRO BOULEVARD',
        'H_10': 'CHESTNUT BLVD',
        'H_30': 'SOUTH CRAVE WAY',
        'V_-30': '1ST CENTRAL STREET',
        'V_-10': '4TH HARBOR ROAD',
        'V_10': 'PARKWAY DRIVE',
        'V_30': 'HIGHLAND AVENUE'
      };

      roadCoords.forEach(coord => {
        const hRoadGeo = new THREE.PlaneGeometry(100, roadWidth);
        const hRoad = new THREE.Mesh(hRoadGeo, roadMat);
        hRoad.rotation.x = -Math.PI / 2;
        hRoad.position.set(0, 0.01, coord);
        hRoad.receiveShadow = true;
        scene.add(hRoad);

        const vRoadGeo = new THREE.PlaneGeometry(roadWidth, 100);
        const vRoad = new THREE.Mesh(vRoadGeo, roadMat);
        vRoad.rotation.x = -Math.PI / 2;
        vRoad.position.set(coord, 0.01, 0);
        vRoad.receiveShadow = true;
        scene.add(vRoad);

        for (let p = -45; p <= 45; p += 6) {
          const hLineGeo = new THREE.PlaneGeometry(3, 0.25);
          const hLine = new THREE.Mesh(hLineGeo, lineMat);
          hLine.rotation.x = -Math.PI / 2;
          hLine.position.set(p, 0.02, coord);
          scene.add(hLine);

          const vLineGeo = new THREE.PlaneGeometry(0.25, 3);
          const vLine = new THREE.Mesh(vLineGeo, lineMat);
          vLine.rotation.x = -Math.PI / 2;
          vLine.position.set(coord, 0.02, p);
          scene.add(vLine);
        }
      });

      // City Blocks & Buildings
      const blockCenters = [-20, 0, 20];
      blockCenters.forEach((bx) => {
        blockCenters.forEach((bz) => {
          const sideGeo = new THREE.BoxGeometry(blockWidth, 0.4, blockWidth);
          const sidewalk = new THREE.Mesh(sideGeo, sidewalkMat);
          sidewalk.position.set(bx, 0.2, bz);
          sidewalk.receiveShadow = true;
          scene.add(sidewalk);

          const subConfigs = [
            { ox: -3.2, oz: -3.2, w: 5.5, d: 5.5, h: 6 + ((Math.abs(bx * 3 + bz * 7)) % 8) },
            { ox: 3.2, oz: -3.2, w: 5.5, d: 5.5, h: 5 + ((Math.abs(bx * 5 + bz * 2)) % 7) },
            { ox: -3.2, oz: 3.2, w: 5.5, d: 5.5, h: 7 + ((Math.abs(bx * 2 + bz * 9)) % 9) },
            { ox: 3.2, oz: 3.2, w: 5.5, d: 5.5, h: 6 + ((Math.abs(bx * 7 + bz * 4)) % 10) },
          ];

          subConfigs.forEach((bld, idx) => {
            const bCol = buildingColors[(Math.abs(bx + bz + idx + 10)) % buildingColors.length];
            const bMat = new THREE.MeshStandardMaterial({ color: bCol, roughness: 0.8, flatShading: true });
            
            const bGeo = new THREE.BoxGeometry(bld.w, bld.h, bld.d);
            const bMesh = new THREE.Mesh(bGeo, bMat);
            bMesh.position.set(bx + bld.ox, 0.4 + bld.h / 2, bz + bld.oz);
            bMesh.castShadow = true;
            bMesh.receiveShadow = true;
            scene.add(bMesh);

            const acGeo = new THREE.BoxGeometry(1.5, 0.8, 1.5);
            const acMesh = new THREE.Mesh(acGeo, darkMat);
            acMesh.position.set(bx + bld.ox, 0.4 + bld.h + 0.4, bz + bld.oz);
            acMesh.castShadow = true;
            scene.add(acMesh);

            if (bld.h > 7) {
              const winGeo = new THREE.BoxGeometry(bld.w * 0.8, bld.h * 0.7, bld.d * 1.02);
              const winMesh = new THREE.Mesh(winGeo, windowMat);
              winMesh.position.set(bx + bld.ox, 0.4 + bld.h / 2, bz + bld.oz);
              scene.add(winMesh);
            }
          });

          const treeOffsets = [
            { tx: -6, tz: -6 },
            { tx: 6, tz: 6 },
          ];
          treeOffsets.forEach(to => {
            const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.2, 5);
            const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
            trunk.position.set(bx + to.tx, 0.4 + 0.6, bz + to.tz);
            trunk.castShadow = true;
            scene.add(trunk);

            const foliageGeo = new THREE.ConeGeometry(1.2, 2.4, 5);
            const foliage = new THREE.Mesh(foliageGeo, treeLeafMat1);
            foliage.position.set(bx + to.tx, 0.4 + 1.2 + 1.2, bz + to.tz);
            foliage.castShadow = true;
            scene.add(foliage);
          });
        });
      });

      // Restaurant Hub Point (Origin at X: -30, Z: -30)
      const restGeo = new THREE.BoxGeometry(7, 8, 7);
      const restMesh = new THREE.Mesh(restGeo, accentMat);
      restMesh.position.set(-20, 4.4, -20);
      restMesh.castShadow = true;
      scene.add(restMesh);

      // Destination Waypoints
      const candidateDestinations = [
        { x: 10, z: 30, name: 'EMBASSY RESIDENCES' },
        { x: 30, z: 10, name: 'PARKWAY TERRACES' },
        { x: 30, z: 30, name: 'HIGHLAND CENTRAL LOFTS' },
        { x: -10, z: 30, name: 'HARBOR SUITES' },
        { x: 30, z: -10, name: 'METRO HEIGHTS' },
        { x: 10, z: 10, name: 'CENTRAL PLAZA' },
        { x: -30, z: 30, name: 'NORTH VISTAS' },
        { x: 30, z: -30, name: 'EAST RIDGE APTS' },
      ];
      const destTargetObj = candidateDestinations[destinationIndex % candidateDestinations.length];
      const destTarget = new THREE.Vector3(destTargetObj.x, 0, destTargetObj.z);

      // Floating 3D Waypoint Pin
      const pinGroup = new THREE.Group();
      const pinHeadGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const pinHead = new THREE.Mesh(pinHeadGeo, accentMat);
      pinHead.position.y = 4.5;
      
      const pinConeGeo = new THREE.ConeGeometry(1.0, 2.5, 8);
      const pinCone = new THREE.Mesh(pinConeGeo, accentMat);
      pinCone.rotation.x = Math.PI;
      pinCone.position.y = 3.0;

      pinGroup.add(pinHead);
      pinGroup.add(pinCone);
      pinGroup.position.copy(destTarget);
      scene.add(pinGroup);

      // Pulsing radar ring
      const ringGeo = new THREE.RingGeometry(1.5, 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xC45D4A, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(destTarget.x, 0.05, destTarget.z);
      scene.add(ringMesh);

      // Graph & Shortest-Path (Dijkstra)
      const nodes = [];
      const nodeMap = {};
      roadCoords.forEach((rx) => {
        roadCoords.forEach((rz) => {
          const id = rx + '_' + rz;
          const node = { id, x: rx, z: rz, neighbors: [] };
          nodes.push(node);
          nodeMap[id] = node;
        });
      });

      nodes.forEach(n => {
        roadCoords.forEach(rx => {
          if (Math.abs(rx - n.x) === 20 && n.z === n.z) {
            const neighborId = rx + '_' + n.z;
            if (nodeMap[neighborId]) n.neighbors.push(nodeMap[neighborId]);
          }
        });
        roadCoords.forEach(rz => {
          if (Math.abs(rz - n.z) === 20 && n.x === n.x) {
            const neighborId = n.x + '_' + rz;
            if (nodeMap[neighborId]) n.neighbors.push(nodeMap[neighborId]);
          }
        });
      });

      function findShortestPath(startId, endId) {
        const distances = {};
        const previous = {};
        const unvisited = new Set();

        nodes.forEach(n => {
          distances[n.id] = Infinity;
          previous[n.id] = null;
          unvisited.add(n.id);
        });

        distances[startId] = 0;

        while (unvisited.size > 0) {
          let currentId = null;
          let minDistance = Infinity;
          unvisited.forEach(id => {
            if (distances[id] < minDistance) {
              minDistance = distances[id];
              currentId = id;
            }
          });

          if (!currentId || currentId === endId) break;
          unvisited.delete(currentId);

          const current = nodeMap[currentId];
          current.neighbors.forEach(neighbor => {
            if (unvisited.has(neighbor.id)) {
              const alt = distances[currentId] + 20;
              if (alt < distances[neighbor.id]) {
                distances[neighbor.id] = alt;
                previous[neighbor.id] = currentId;
              }
            }
          });
        }

        const path = [];
        let curr = endId;
        while (curr) {
          path.unshift(nodeMap[curr]);
          curr = previous[curr];
        }
        return path;
      }

      const endNodeId = destTargetObj.x + '_' + destTargetObj.z;
      const shortestRoute = findShortestPath('-30_-30', endNodeId);

      // Route Path Line
      const pathPoints = shortestRoute.map(n => new THREE.Vector3(n.x, 0.1, n.z));
      const pathCurve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.0);
      const pathGeo = new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(100));
      const pathMat = new THREE.LineBasicMaterial({ color: 0xC45D4A, linewidth: 4 });
      const pathLine = new THREE.Line(pathGeo, pathMat);
      scene.add(pathLine);

      // ==============================================================
      // LOW-POLY DELIVERY BIKE & RIDER (PARALLEL WHEELS & PROPORTIONS)
      // ==============================================================
      const bikeGroup = new THREE.Group();

      // Factory for a Bicycle Wheel lying strictly in the YZ plane (parallel to frame)
      function createBikeWheel() {
        const wheelAssembly = new THREE.Group();

        // 1. Tire (Torus rotated by 90 deg around Y -> lies in YZ plane)
        const tireGeo = new THREE.TorusGeometry(0.7, 0.08, 8, 24);
        const tire = new THREE.Mesh(tireGeo, darkMat);
        tire.rotation.y = Math.PI / 2; // STRICTLY PARALLEL TO FRAME!
        wheelAssembly.add(tire);

        // 2. Inner Rim
        const rimGeo = new THREE.TorusGeometry(0.62, 0.03, 6, 24);
        const rim = new THREE.Mesh(rimGeo, metalMat);
        rim.rotation.y = Math.PI / 2;
        wheelAssembly.add(rim);

        // 3. Central Hub Axle
        const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8);
        const hub = new THREE.Mesh(hubGeo, metalMat);
        hub.rotation.z = Math.PI / 2;
        wheelAssembly.add(hub);

        // 4. Radial Spokes (in YZ plane)
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 6) * i;
          const spokeGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.24, 4);
          const spoke = new THREE.Mesh(spokeGeo, metalMat);
          spoke.rotation.x = angle;
          wheelAssembly.add(spoke);
        }

        wheelAssembly.castShadow = true;
        return wheelAssembly;
      }

      // Front Wheel
      const frontWheelAssembly = createBikeWheel();
      frontWheelAssembly.position.set(0, 0.7, 1.6);
      bikeGroup.add(frontWheelAssembly);

      // Rear Wheel
      const rearWheelAssembly = createBikeWheel();
      rearWheelAssembly.position.set(0, 0.7, -1.4);
      bikeGroup.add(rearWheelAssembly);

      // Bike Frame Tubes
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1E2024, roughness: 0.5, metalness: 0.6, flatShading: true });
      
      // Top Tube
      const topTubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.7, 6);
      const topTube = new THREE.Mesh(topTubeGeo, frameMat);
      topTube.rotation.x = Math.PI / 2;
      topTube.position.set(0, 1.9, 0.25);
      bikeGroup.add(topTube);

      // Down Tube
      const downTubeGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.7, 6);
      const downTube = new THREE.Mesh(downTubeGeo, frameMat);
      downTube.rotation.x = -Math.PI / 4;
      downTube.position.set(0, 1.3, 0.5);
      bikeGroup.add(downTube);

      // Seat Tube
      const seatTubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6);
      const seatTube = new THREE.Mesh(seatTubeGeo, frameMat);
      seatTube.rotation.x = 0.35;
      seatTube.position.set(0, 1.4, -0.35);
      bikeGroup.add(seatTube);

      // Chainstay
      const chainstayGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6);
      const chainstay = new THREE.Mesh(chainstayGeo, frameMat);
      chainstay.rotation.x = Math.PI / 2;
      chainstay.position.set(0, 0.7, -0.75);
      bikeGroup.add(chainstay);

      // Seatstay
      const seatstayGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.45, 6);
      const seatstay = new THREE.Mesh(seatstayGeo, frameMat);
      seatstay.rotation.x = 0.58;
      seatstay.position.set(0, 1.3, -1.0);
      bikeGroup.add(seatstay);

      // Fork (Left & Right blades)
      const forkGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6);
      const forkLeft = new THREE.Mesh(forkGeo, frameMat);
      forkLeft.rotation.x = -0.39;
      forkLeft.position.set(-0.12, 1.3, 1.35);
      bikeGroup.add(forkLeft);

      const forkRight = new THREE.Mesh(forkGeo, frameMat);
      forkRight.rotation.x = -0.39;
      forkRight.position.set(0.12, 1.3, 1.35);
      bikeGroup.add(forkRight);

      // Handlebars
      const handlebarGeo = new THREE.BoxGeometry(1.6, 0.08, 0.12);
      const handlebar = new THREE.Mesh(handlebarGeo, darkMat);
      handlebar.position.set(0, 2.05, 1.1);
      bikeGroup.add(handlebar);

      // Saddle
      const saddleGeo = new THREE.BoxGeometry(0.4, 0.12, 0.85);
      const saddle = new THREE.Mesh(saddleGeo, darkMat);
      saddle.position.set(0, 2.2, -0.6);
      bikeGroup.add(saddle);

      // Headlight Beam
      const lightGeo = new THREE.ConeGeometry(1.2, 5, 8);
      const lightBeamMat = new THREE.MeshBasicMaterial({ color: 0xFFFBE6, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      const lightBeam = new THREE.Mesh(lightGeo, lightBeamMat);
      lightBeam.rotation.x = -Math.PI / 2.2;
      lightBeam.position.set(0, 1.9, 3.4);
      bikeGroup.add(lightBeam);

      // Courier Rider
      const riderCyclist = new THREE.Group();

      // Torso
      const torsoGeo = new THREE.BoxGeometry(0.85, 1.1, 0.65);
      const torsoMat = new THREE.MeshStandardMaterial({ color: 0x23272F, roughness: 0.8, flatShading: true });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.rotation.x = 0.45;
      torso.position.set(0, 2.4, -0.1);
      torso.castShadow = true;
      riderCyclist.add(torso);

      // Helmet (Terracotta #C45D4A)
      const helmetGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const helmet = new THREE.Mesh(helmetGeo, accentMat);
      helmet.position.set(0, 3.1, 0.2);
      helmet.castShadow = true;
      riderCyclist.add(helmet);

      // Visor
      const visorGeo = new THREE.BoxGeometry(0.6, 0.25, 0.3);
      const visor = new THREE.Mesh(visorGeo, darkMat);
      visor.position.set(0, 3.1, 0.45);
      riderCyclist.add(visor);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.0, 5);
      const leftArm = new THREE.Mesh(armGeo, torsoMat);
      leftArm.rotation.x = -0.65;
      leftArm.position.set(-0.45, 2.2, 0.45);
      riderCyclist.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, torsoMat);
      rightArm.rotation.x = -0.65;
      rightArm.position.set(0.45, 2.2, 0.45);
      riderCyclist.add(rightArm);

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.11, 0.11, 1.1, 5);
      const leftLeg = new THREE.Mesh(legGeo, darkMat);
      leftLeg.rotation.x = 0.35;
      leftLeg.position.set(-0.25, 1.3, -0.2);
      riderCyclist.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, darkMat);
      rightLeg.rotation.x = -0.25;
      rightLeg.position.set(0.25, 1.25, 0.0);
      riderCyclist.add(rightLeg);

      // Delivery Backpack (Terracotta #C45D4A)
      const backpackGeo = new THREE.BoxGeometry(1.0, 1.2, 0.75);
      const backpack = new THREE.Mesh(backpackGeo, accentMat);
      backpack.rotation.x = 0.45;
      backpack.position.set(0, 2.6, -0.65);
      backpack.castShadow = true;
      riderCyclist.add(backpack);

      const stripeGeo = new THREE.BoxGeometry(1.02, 0.25, 0.77);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = 0.45;
      stripe.position.set(0, 2.6, -0.65);
      riderCyclist.add(stripe);

      bikeGroup.add(riderCyclist);
      scene.add(bikeGroup);

      // Navigation State
      let currentWaypointIndex = 0;
      let progressBetweenWaypoints = 0;
      const speed = 0.0032; // smooth, steady delivery pace
      let isDeliveredState = isAlreadyDelivered;
      let hasPostedDelivered = isAlreadyDelivered;

      if (isAlreadyDelivered) {
        const lastNode = shortestRoute[shortestRoute.length - 1];
        bikeGroup.position.set(lastNode.x, 0, lastNode.z);
      } else {
        bikeGroup.position.set(shortestRoute[0].x, 0, shortestRoute[0].z);
      }

      // Drag / Touch Controls
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let cameraAngleOffset = 0;
      let cameraPitchOffset = 0;

      window.addEventListener('touchstart', (e) => {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      });

      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        cameraAngleOffset += deltaX * 0.008;
        cameraPitchOffset = Math.max(-0.3, Math.min(0.4, cameraPitchOffset + deltaY * 0.005));
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      });

      window.addEventListener('touchend', () => {
        isDragging = false;
      });

      function sendTelemetry(data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      sendTelemetry({ type: 'LOADED' });

      if (isAlreadyDelivered) {
        sendTelemetry({
          type: 'TELEMETRY',
          distance: '0.0 KM',
          eta: 'ARRIVED',
          street: 'DELIVERED TO DESTINATION',
          speed: '0 KM/H',
          status: 'DELIVERED',
        });
      }

      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Animate Destination Beacon
        pinGroup.position.y = Math.sin(time * 3) * 0.4;
        const ringScale = 1 + (time % 2) * 0.6;
        ringMesh.scale.set(ringScale, ringScale, 1);
        ringMat.opacity = Math.max(0, 0.8 - (time % 2) * 0.4);

        if (!isDeliveredState && currentWaypointIndex < shortestRoute.length - 1) {
          const fromNode = shortestRoute[currentWaypointIndex];
          const toNode = shortestRoute[currentWaypointIndex + 1];

          progressBetweenWaypoints += speed;

          const posX = THREE.MathUtils.lerp(fromNode.x, toNode.x, progressBetweenWaypoints);
          const posZ = THREE.MathUtils.lerp(fromNode.z, toNode.z, progressBetweenWaypoints);
          bikeGroup.position.set(posX, 0, posZ);

          const dirX = toNode.x - fromNode.x;
          const dirZ = toNode.z - fromNode.z;
          const targetAngle = Math.atan2(dirX, dirZ);
          
          let currentAngle = bikeGroup.rotation.y;
          let diff = targetAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          bikeGroup.rotation.y += diff * 0.1;

          // Banking tilt
          bikeGroup.rotation.z = -diff * 0.8;

          // Rolling Wheels around local X axle
          frontWheelAssembly.rotation.x += 0.22;
          rearWheelAssembly.rotation.x += 0.22;

          // Pedaling bounce
          riderCyclist.position.y = Math.sin(time * 14) * 0.03;

          if (progressBetweenWaypoints >= 1.0) {
            progressBetweenWaypoints = 0;
            currentWaypointIndex++;

            const segmentsRemaining = (shortestRoute.length - 1) - currentWaypointIndex;
            const distKm = Math.max(0.1, (segmentsRemaining * 0.35)).toFixed(1);
            const etaMin = Math.max(1, Math.round(segmentsRemaining * 2));
            
            const currentStreetKey = dirX !== 0 ? 'H_' + fromNode.z : 'V_' + fromNode.x;
            const streetName = streetNames[currentStreetKey] || 'METRO CORRIDOR';

            sendTelemetry({
              type: 'TELEMETRY',
              distance: distKm + ' KM',
              eta: etaMin + ' MIN',
              street: 'ON ' + streetName,
              speed: '22 KM/H',
              status: 'EN ROUTE',
            });
          }
        } else if (!isDeliveredState) {
          // Arrived at destination! (STOPS HERE PERMANENTLY, DOES NOT RESTART)
          isDeliveredState = true;
          bikeGroup.rotation.z = 0;
          bikeGroup.position.set(destTarget.x, 0, destTarget.z);

          if (!hasPostedDelivered) {
            hasPostedDelivered = true;
            sendTelemetry({
              type: 'TELEMETRY',
              distance: '0.0 KM',
              eta: 'ARRIVED',
              street: 'DELIVERED TO DESTINATION',
              speed: '0 KM/H',
              status: 'DELIVERED',
            });
          }
        }

        // Camera Follow
        const targetCamDist = 28;
        const baseAngle = 0.75 + cameraAngleOffset;
        const camX = bikeGroup.position.x + Math.sin(baseAngle) * targetCamDist;
        const camZ = bikeGroup.position.z + Math.cos(baseAngle) * targetCamDist;
        const camY = 24 + cameraPitchOffset * 20;

        camera.position.x += (camX - camera.position.x) * 0.05;
        camera.position.y += (camY - camera.position.y) * 0.05;
        camera.position.z += (camZ - camera.position.z) * 0.05;
        camera.lookAt(bikeGroup.position.x, 2, bikeGroup.position.z);

        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    })();
  </script>
</body>
</html>
    `;
  }, [destinationIndex, initialDelivered]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOADED') {
        setIsLoaded(true);
      } else if (data.type === 'TELEMETRY') {
        setTelemetry({
          distance: data.distance,
          eta: data.eta,
          street: data.street,
          speed: data.speed,
          status: data.status,
        });
        if (data.status === 'DELIVERED') {
          setIsDelivered(true);
        }
        if (onStatusChangeRef.current) {
          onStatusChangeRef.current(data.status);
        }
      }
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />

      {/* Loading Overlay */}
      {!isLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>INITIALIZING 3D ROUTING...</Text>
        </View>
      )}

      {/* Delivered Center Banner: Equal visual width typography */}
      {isDelivered ? (
        <View style={styles.deliveredCenterCard}>
          <View style={styles.deliveredInner}>
            <Text style={styles.deliveredLineOrder}>ORDER</Text>
            <Text style={styles.deliveredLineDelivered}>DELIVERED</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Top Floating Live Badge */}
          <View style={styles.topBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>3D LIVE ROUTING (A* MIN-DIST)</Text>
          </View>

          {/* Bottom Telemetry HUD */}
          <View style={styles.hudContainer}>
            <View style={styles.hudRow}>
              <View style={styles.hudMetric}>
                <Text style={styles.hudLabel}>DISTANCE</Text>
                <Text style={styles.hudValue}>{telemetry.distance}</Text>
              </View>
              <View style={styles.hudDivider} />
              <View style={styles.hudMetric}>
                <Text style={styles.hudLabel}>ETA</Text>
                <Text style={styles.hudValue}>{telemetry.eta}</Text>
              </View>
              <View style={styles.hudDivider} />
              <View style={styles.hudMetric}>
                <Text style={styles.hudLabel}>SPEED</Text>
                <Text style={styles.hudValue}>{telemetry.speed}</Text>
              </View>
            </View>
            <View style={styles.streetRow}>
              <Text style={styles.streetText} numberOfLines={1}>
                ● {telemetry.street}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    position: 'relative',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 1.5,
  },
  topBadge: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 32, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadows.card,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  hudContainer: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    ...Shadows.card,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  hudMetric: {
    alignItems: 'center',
    flex: 1,
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.muted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  hudValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  hudDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  streetRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
  },
  streetText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  // Centered Delivered Banner
  deliveredCenterCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 247, 242, 0.40)',
  },
  deliveredInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(26, 28, 32, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  deliveredLineOrder: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 4.0,
    marginRight: -4.0,
    textAlign: 'center',
  },
  deliveredLineDelivered: {
    fontSize: 12.5,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 1.8,
    marginRight: -1.8,
    textAlign: 'center',
    marginTop: 3,
  },
});
