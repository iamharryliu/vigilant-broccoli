import { Component } from '@angular/core';
import { ImageGalleryComponent } from '../../features/image-gallery/image-gallery.component';

@Component({
  standalone: true,
  selector: 'app-albums-page',
  templateUrl: './albums-page.component.html',
  imports: [ImageGalleryComponent],
})
export class AlbumsPageComponent {
  images = [
    'https://freight.cargo.site/w/1000/q/75/i/9ea4579e1c17b78fc36a844f2b515a94e5828400290070f45c5ea11c71384b7b/Kylie_Disco_Web_RGB-1800x0-c-default.jpg',
    'https://freight.cargo.site/w/1000/q/75/i/0ba861e5a2cfe78a1d7b38819b41ca7fe54174a70bd177485d5ab50e2dc791d1/StudioMoross_SpiceGirls_00.png',
    'https://freight.cargo.site/w/1000/q/75/i/3d68c542c695c05d6c7ce09e190679d884126a38884e8d723c54758eaf8ca2ff/Disclosure-Brixton-Academy-4th-March-2022-by-Luke-Dyson-LD1_1723-1400x0-c-default.jpg',
    'https://freight.cargo.site/w/1000/q/75/i/e27ac48a6febc52d3c5a48ab8133851293123c3a75445c0254922df158b48b7c/Crops.png',
    'https://freight.cargo.site/w/1000/q/75/i/02c8661025035fab78f266731acc6a72a59b9e0a8b58abd253db23f7bb8255c8/Adobe_SplashPage_Kate_Moross_Final_Flat_2.png',
    'https://freight.cargo.site/w/1000/q/75/i/5084ece86bec65d4c4c3dc38619359522000a736a53e1293e258b34845a2bd21/Studio-Moross-London-Grammar-Ally-Pally-12th-November-2021-by-Luke-Dyson-LD2_0310-scaled-1800x0-c-default.jpg',
  ];
}
