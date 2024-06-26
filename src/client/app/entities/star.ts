import * as THREE from 'three'
import { ATMOSPHERES_ENABLED, WIREFRAME } from '../constants'
import { Entity, EntityType } from './entity'

import coronaFragmentShader from '../shaders/stars/corona_fragment_shader.glsl'
import surfaceFragmentShader from '../shaders/stars/surface_fragment_shader.glsl'
import vertexShader from '../shaders/vertex_shader.glsl'

import { app } from '../../app'

export enum StarType {
    RedGiant = "red_giant",
    Yellow = "yellow",
    Dwarf = "dwarf",
}

export class Star extends Entity {

    public starType: StarType = StarType.Yellow
    public radius: number = 0.0
    public rotationSpeed = 0.0
    public starColor: THREE.Color = new THREE.Color(0xffffff)

    private starColors: Map<StarType, THREE.Color> = new Map([
        [StarType.RedGiant, new THREE.Color(0xe67f77)],
        [StarType.Yellow, new THREE.Color(0xf0ca48)],
        [StarType.Dwarf, new THREE.Color(0xfbbd59)],
    ])

    constructor() {
        super()
        this.type = EntityType.Star
        this.starColor = this.starColors.get(this.starType) || new THREE.Color(0xffffff)
    }

    init(): THREE.Object3D {
        const star = new THREE.Mesh()

        // Geometry
        star.geometry = new THREE.SphereGeometry(this.radius, 32, 16)

        // Surface
        star.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: surfaceFragmentShader,
            wireframe: WIREFRAME,
            uniforms: {
                r: { value: this.starColor.r },
                g: { value: this.starColor.g },
                b: { value: this.starColor.b },
            }
        })

        if (ATMOSPHERES_ENABLED) {
            const coronaMaterial = this.createCorona()
            const corona = new THREE.Mesh(star.geometry, coronaMaterial)
            corona.scale.set(1.5, 1.5, 1.5)
            star.add(corona)
        }

        return star
    }

    createCorona(): THREE.ShaderMaterial {
        const coronaMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: coronaFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            wireframe: WIREFRAME,
            uniforms: {
                r: { value: this.starColor.r },
                g: { value: this.starColor.g },
                b: { value: this.starColor.b },
            }
        })
        return coronaMaterial
    }

    createLight(): THREE.SpotLight {
        const light = new THREE.SpotLight(0xffffff, 1)
        light.position.set(0, 0, 0)
        return light
    }

    onClick(): void {
        if (app.focusedEntity !== this) {
            console.log(this)
            app.focusedEntity = this
            this.lookAt()
            this.getDebugUI()
        }
    }

    onMouseOver(): void {
        if (this.object instanceof THREE.Mesh) {
            // this.object.material.emissive.setHex(0x666666)
            // this.object.material.emissiveIntensity = 0.1
        }
    }

    onMouseLeave(): void {
        if (this.object instanceof THREE.Mesh) {
            // this.object.material.emissive.setHex(0x000000)
            // this.object.material.emissiveIntensity = 0
        }
    }

    update(): void {
        this.object.rotation.y += this.rotationSpeed
    }

    getStarTypeString(): string {
        switch (this.starType) {
            case StarType.RedGiant: return "Red Giant"
            case StarType.Yellow: return "Yellow"
            case StarType.Dwarf: return "Dwarf"
            default: return "Unknown"
        }
    }
}
