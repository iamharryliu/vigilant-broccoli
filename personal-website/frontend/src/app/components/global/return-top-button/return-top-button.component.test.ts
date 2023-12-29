import { ReturnTopButtonComponent } from '@app/components/global/return-top-button/return-top-button.component';


window.scrollTo = jest.fn();

describe('ReturnTopButtonComponent', () => {
  let component: ReturnTopButtonComponent;

  beforeEach(() => {
    component = new ReturnTopButtonComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set showScrollButton to true when scrolled more than 100 pixels', () => {
    Object.defineProperty(window, 'scrollY', { value: 150 });
    component.onScroll();
    expect(component.showScrollButton).toBe(true);
  });

  it('should set showScrollButton to false when scrolled less than or equal to 100 pixels', () => {
    Object.defineProperty(window, 'scrollY', { value: 50 });
    component.onScroll();
    expect(component.showScrollButton).toBe(false);
  });

  it('should scroll to top when scrollToTop is called', () => {
    const spy = jest.spyOn(window, 'scrollTo');
    component.scrollToTop();
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
