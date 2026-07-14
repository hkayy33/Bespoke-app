import { Component } from '@angular/core';
import { CarouselImage } from '../carousel-image/carousel-image';

@Component({
  selector: 'app-carousel',
  imports: [CarouselImage],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
})
export class Carousel {
  /** App store marketing screenshots provided by the latest export. */
  readonly slides: {
    src: string;
    alt: string;
    title: string;
    description: string;
  }[] = [
    {
      src: '/images/carousel/slide-1.png',
      alt: 'BespokeDua screen where a user types a heartfelt dua request',
      title: 'Type What Is In Your Heart',
      description:
        'Share your thoughts in your own words and let BespokeDua transform them into a meaningful prayer.',
    },
    {
      src: '/images/carousel/slide-2.png',
      alt: 'BespokeDua app showing a personalised generated dua',
      title: 'Receive Your BespokeDua',
      description:
        'Get a personalised dua crafted for your moment, with language that feels sincere and spiritually grounded.',
    },
    {
      src: '/images/carousel/slide-3.png',
      alt: 'BespokeDua reflection panel helping the user understand the dua',
      title: 'Understand Through Reflection',
      description:
        'Explore clear reflections that explain the meaning, themes, and guidance behind each generated dua.',
    },
    {
      src: '/images/carousel/slide-4.png',
      alt: 'Saved duas list in BespokeDua for easy future access',
      title: 'Save It So You Never Forget',
      description:
        'Keep your favorite duas in one place and return to them whenever you need comfort, clarity, or consistency.',
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
