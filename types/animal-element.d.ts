import { LitElement } from 'lit';
export declare class AnimalElement extends LitElement {
    /**
     * animalHead...
     */
    animalHead: String;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'animal-element': AnimalElement;
    }
}
