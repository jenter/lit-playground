import { AnimalElement } from './animal-element';
export declare class DogElement extends AnimalElement {
    /**
     * dogHead...
     */
    dogHead: String;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'dog-element': DogElement;
    }
}
