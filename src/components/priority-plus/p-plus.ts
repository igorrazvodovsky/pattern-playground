// A butchered version of https://github.com/jayfreestone/priority-plus
// TODO: check classes on buttons and adjust the dropdown trigger accordingly

import createEventHandler from './event-handler';

enum El {
  Container = 'container',
  Main = 'main',
  PrimaryNavWrapper = 'primary-nav-wrapper',
  PrimaryNav = 'primary-nav',
  OverflowNav = 'overflow-nav',
  ToggleBtn = 'toggle-btn',
  NavItems = 'nav-item',
}

type NavType = El.PrimaryNav | El.OverflowNav;

enum StateModifiers {
  ButtonVisible = 'is-showing-toggle',
  PrimaryHidden = 'is-hiding-primary',
}

interface ElementRefs {
  [El.Container]: HTMLElement;
  clone: {
    [El.Main]: HTMLElement;
    [El.NavItems]: HTMLElement[];
    [El.ToggleBtn]: HTMLElement;
  };
  primary: {
    [El.Main]: HTMLElement;
    [El.PrimaryNavWrapper]: HTMLElement;
    [El.PrimaryNav]: HTMLElement;
    [El.NavItems]: HTMLLIElement[];
    [El.OverflowNav]: HTMLElement;
    [El.ToggleBtn]: HTMLElement;
  };
}
interface Instance {
  eventListeners: Map<((eventDetail: CustomEvent<{}>) => void), {
    eventType: string;
    wrappedCallback: (eventDetail: CustomEvent<{}>) => void;
  }>;
  itemMap: WeakMap<HTMLElement | Element, NavType>;
  observer: IntersectionObserver;
}
interface Options {
  classNames: {
    [El.Container]: string[];
    [El.Main]: string[];
    [El.PrimaryNavWrapper]: string[];
    [El.PrimaryNav]: string[];
    [El.OverflowNav]: string[];
    [El.ToggleBtn]: string[];
    [El.NavItems]: string[];
  };
  collapseAtCount: number;
}

const defaultOptions: Options = {
  classNames: {
    [El.Container]: ['pp-p-plus-container'],
    [El.Main]: ['pp-p-plus'],
    [El.PrimaryNavWrapper]: ['pp-p-plus__primary-wrapper'],
    [El.PrimaryNav]: ['pp-p-plus__primary'],
    [El.OverflowNav]: ['pp-p-plus__overflow'],
    [El.ToggleBtn]: ['pp-p-plus__toggle-btn'],
    [El.NavItems]: ['pp-p-plus__primary-nav-item'],
  },
  collapseAtCount: -1,
};

function createItemsChangedEvent({ overflowCount }: { overflowCount: number }) {
  return new CustomEvent("itemsChanged", {
    detail: { overflowCount },
  });
}

function createMirror() {
  const cache = new WeakMap();

  /**
   * Retrieves a Map of 'mirrored' elements, collected by index, e.g.
   * the comparable element in a different array that shares the same index.
   */
  return function getMirror(keyArr: HTMLElement[], valueArr: HTMLElement[]): Map<HTMLElement, HTMLElement> {
    if (!cache.get(keyArr)) {
      cache.set(
        keyArr,
        new Map(Array.from(keyArr).reduce((acc: any[], item, i) => (
          acc.concat([[item, valueArr[i]]])
        ), [])),
      );
    }

    return cache.get(keyArr);
  };
}

function priorityPlus(targetElem: HTMLElement) {

  const options = {
    classNames: { ...defaultOptions.classNames },
  } as Options;

  const { classNames } = options;

  // The instance's event emitter.
  const eventHandler = createEventHandler();

  // 'Instance' state variables and misc references. Force a cast as we know we will initialise these.
  const inst: Instance = {
    eventListeners: new Map(),
    itemMap: new WeakMap(),
  } as Instance;

  // References to DOM elements so we can easily retrieve them. Force a cast as we know we will initialise these.
  const el: ElementRefs = {
    clone: {},
    primary: {},
  } as ElementRefs;

  // Gets an element's 'mirror' Map for the clone/primary navigation - e.g. if you pass a clone Map, you get the original Map and vice-versa.
  const getElemMirror = createMirror();

  // Generates classes based on an element name.
  function cn(key: El): string {
    return classNames[key].join(' ');
  }

  // Generates data-attributes based on an element name. These are used to query the generated DOM and populate the 'el' object.
  function dv(key: El): string {
    return `data-${key}`;
  }

  // Generates the HTML wrapper to use in-place of the user's supplied list.
  function createMarkup(): string {
    return `
      <div ${dv(El.Main)} class="${cn(El.Main)}">
        <div class="${cn(El.PrimaryNavWrapper)}" ${dv(El.PrimaryNavWrapper)}></div>
        <pp-dropdown hoist>
          <button is="pp-button"
            slot="trigger"
            ${dv(El.ToggleBtn)}
            class="button ${cn(El.ToggleBtn)}"
            aria-expanded="false"
          ><iconify-icon class="icon" icon="ph:dots-three"></iconify-icon>
          </button>
          <pp-list
            ${dv(El.OverflowNav)}
            aria-hidden="true"
          >
          </pp-list>
        </pp-dropdown>
      </div>
    `;
  }

  // Clones the target list and enhances it with additional properties, such as data attributes and classes.
  function cloneNav(elem: HTMLElement): HTMLElement {
    const targetClone = elem.cloneNode(true) as HTMLElement;
    enhanceOriginalList(targetClone);

    const navItems = Array.from(targetClone.children) as HTMLLIElement[];
    navItems.forEach(enhanceOriginalNavItem)

    return targetClone;
  }

  // Enhance the original list element with classes/attributes.
  function enhanceOriginalList(elem: HTMLElement) {
    elem.classList.add(...classNames[El.PrimaryNav])
    elem.setAttribute(dv(El.PrimaryNav), '');
  }

  // Enhance an original list list-item with classes/attributes.
  function enhanceOriginalNavItem(elem: HTMLLIElement) {
    elem.classList.add(...classNames[El.NavItems])
    elem.setAttribute(dv(El.NavItems), '');
  }

  // Replaces the navigation with the two clones and populates the 'el' object.
  function setupEl() {
    const { itemMap } = inst;
    const markup = createMarkup();
    const container = document.createElement('div');
    container.classList.add(...classNames[El.Container]);
    container.setAttribute(dv(El.Container), 'true');
    el[El.Container] = container;

    const original = document.createRange().createContextualFragment(markup);

    // Setup the wrapper and clone/enhance the original list.
    el.primary[El.PrimaryNavWrapper] = original.querySelector(`[${dv(El.PrimaryNavWrapper)}]`) as HTMLElement;
    el.primary[El.PrimaryNavWrapper].appendChild(cloneNav(targetElem))

    const cloned = original.cloneNode(true) as Element;

    // Establish references. By this point the list is fully built.
    el.primary[El.Main] = original.querySelector(`[${dv(El.Main)}]`) as HTMLElement;
    el.primary[El.PrimaryNav] = original.querySelector(`[${dv(El.PrimaryNav)}]`) as HTMLElement;
    el.primary[El.NavItems] = Array.from(original.querySelectorAll(`[${dv(El.NavItems)}]`)) as HTMLLIElement[];
    el.primary[El.OverflowNav] = original.querySelector(`[${dv(El.OverflowNav)}]`) as HTMLElement;
    el.primary[El.ToggleBtn] = original.querySelector(`[${dv(El.ToggleBtn)}]`) as HTMLElement;

    el.clone[El.Main] = cloned.querySelector(`[${dv(El.Main)}]`) as HTMLElement;
    el.clone[El.NavItems] = Array.from(cloned.querySelectorAll(`[${dv(El.NavItems)}]`)) as HTMLElement[];
    el.clone[El.ToggleBtn] = cloned.querySelector(`[${dv(El.ToggleBtn)}]`) as HTMLElement;
    el.clone[El.Main].setAttribute('aria-hidden', 'true');
    el.clone[El.Main].setAttribute('data-clone', 'true');
    el.clone[El.Main].classList.add(`${classNames[El.Main][0]}--clone`);
    el.clone[El.Main].classList.add(`${classNames[El.Main][0]}--${StateModifiers.ButtonVisible}`);

    container.appendChild(original);
    container.appendChild(cloned);

    // By default every item belongs in the primary nav, since the intersection observer will run on-load anyway.
    el.clone[El.NavItems].forEach(item => itemMap.set(item, El.PrimaryNav));

    const parent = targetElem.parentNode as HTMLElement;
    parent.replaceChild(container, targetElem);
  }

  // Sets the toggle button visibility.
  function updateBtnDisplay(show: boolean = true) {
    el.primary[El.Main].classList[show ? 'add' : 'remove'](
      `${classNames[El.Main][0]}--${StateModifiers.ButtonVisible}`,
    );
  }

  // Get array of cloned navItems from primary/overflow.
  function getCloneItemsByType(navType: NavType) {
    const { itemMap } = inst;
    // Always use the clone as the base for our new nav, since the order is canonical and it is never filtered.
    return el.clone[El.NavItems].filter(item => itemMap.get(item) === navType);
  }

  // Get a list of cloned elements that we need to render for our navType.
  function getRenderableItems(navType: NavType) {
    const { collapseAtCount } = options;

    if (navType === El.PrimaryNav || collapseAtCount < 0) {
      return getCloneItemsByType(navType);
    }

    const primaryCount = getCloneItemsByType(El.PrimaryNav).length;

    if (primaryCount > 0 && primaryCount <= collapseAtCount) {
      return el.clone[El.NavItems];
    }

    return getCloneItemsByType(navType);
  }

  // (Re)generate the navigation list for either the visible or the overflow nav. Used to completely recreate
  // the nav each time we update it, avoiding ordering complexity and having to run append multiple times on the mounted nav.
  function generateNav(navType: NavType): HTMLElement {
    const newNav = el.primary[navType].cloneNode();

    getRenderableItems(navType)
      .forEach(item => {
        let elem = getElemMirror(
          el.clone[El.NavItems],
          el.primary[El.NavItems],
        ).get(item) as HTMLElement;

        if (navType == El.OverflowNav) {
          var newElem = document.createElement('pp-list-item');
          for (var i = 0; i < elem.attributes.length; i++) {
            var attr = elem.attributes[i];
            newElem.setAttribute(attr.name, attr.value);
          }
          newElem.innerHTML = elem.innerHTML;
          elem = newElem;
        }

        newNav.appendChild(elem);
      });

    return newNav as HTMLElement;
  }

  // Replaces the passed in nav type with a newly generated copy in the DOM.
  function updateNav(navType: NavType) {
    const newNav = generateNav(navType);
    const parent = el.primary[navType].parentNode as HTMLElement;

    // Replace the existing nav element in the DOM
    parent.replaceChild(
      newNav,
      el.primary[navType],
    );

    // Update our reference to it
    el.primary[navType] = newNav;
  }

  // Run every time a nav item intersects with the parent container.
  // Check which type of nav the items belong to.
  function onIntersect({ target, intersectionRatio }: IntersectionObserverEntry) {
    inst.itemMap.set(target, intersectionRatio < 0.99 ? El.OverflowNav : El.PrimaryNav);
  }

  // The IO callback, which collects intersection events.
  function intersectionCallback(events: IntersectionObserverEntry[]) {
    // Update the designation
    events.forEach(onIntersect);

    // Update the navs to reflect the new changes
    ([El.PrimaryNav, El.OverflowNav] as NavType[]).forEach(updateNav);

    eventHandler.trigger(createItemsChangedEvent({
      overflowCount: el.primary[El.OverflowNav].children.length,
    }));

    eventHandler.setEventReady(true);
  }

  // Hide the primary nav when all the navigation items are hidden in the overflow nav).
  function setPrimaryHidden(hidden = true) {
    const hiddenClass = `${classNames[El.Main][0]}--${StateModifiers.PrimaryHidden}`;
    el.primary[El.Main].classList[hidden ? 'add' : 'remove'](hiddenClass);
    el.primary[El.PrimaryNav].setAttribute('aria-hidden', String(hidden));
  }

  // Callback for when either nav is updated.
  function onItemsChanged({ detail: { overflowCount } = {} }: CustomEvent<{ [x: string]: any }>) {
    updateBtnDisplay(overflowCount > 0);

    if (overflowCount === 0) {
      // TODO:
      // setOverflowNavOpen(false);
    }

    setPrimaryHidden(overflowCount === el.clone[El.NavItems].length);
  }

  // Establishes initial event listeners.
  function bindListeners() {
    inst.observer = new IntersectionObserver(intersectionCallback, {
      root: el.clone[El.Main],
      rootMargin: '0px 0px 0px 0px',
      threshold: [0.99],
    });

    el.clone[El.NavItems].forEach(elem => inst.observer.observe(elem));

    eventHandler.on("itemsChanged", onItemsChanged, false);
  }

  (function init() {
    setupEl();
    bindListeners();
  }());
}

export default priorityPlus;
