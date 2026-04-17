import { Component } from '@angular/core';
import { CarouselImage } from '../carousel-image/carousel-image';

@Component({
  selector: 'app-carousel',
  imports: [CarouselImage],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  /** App store marketing screenshots (order: compose → results → reflection). */
  readonly slides: { src: string; alt: string }[] = [
    {
      src: '/images/carousel/phone-1.png',
      alt: 'BespokeDua home screen: writing a dua while duas are generating',
    },
    {
      src: '/images/carousel/phone-2.png',
      alt: 'BespokeDua: personalized dua cards on the Your duas screen',
    },
    {
      src: '/images/carousel/phone-3.png',
      alt: 'BespokeDua: Reflection sheet explaining divine names in a dua',
    },
  ];

  currentIndex = 0;

  prev(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  goTo(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.currentIndex = index;
    }
  }
}
