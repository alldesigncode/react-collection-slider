import React, { useEffect, useCallback, useRef, useState } from 'react';
import { data, DataModel } from '../data';
import { gsap, Expo } from 'gsap';

const pageConstants = {
  DEFAULT_INDEX: 0,
  ACTIVE_ZINDEX: '500',
  INACTIVE_TRANSLATE: '100%',
  POLYGON_INACTIVE: 'polygon(0 76%, 100% 89%, 100% 100%, 0% 100%)',
  POLYGON_ACTIVE: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
};

export const CollectionPage = () => {
  const [list, setList] = useState<DataModel[]>([]);
  const [length, setLength] = useState<number>(pageConstants.DEFAULT_INDEX);
  const [activeIndex, setActiveIndex] = useState<number>(
    pageConstants.DEFAULT_INDEX
  );
  const [activeColorIndex, setActiveColorIndex] = useState<number>(
    pageConstants.DEFAULT_INDEX
  );
  const [activeIndexText, setActiveIndexText] = useState<number>(
    pageConstants.DEFAULT_INDEX
  );
  const [disabled, setDisabled] = useState<boolean>(false);

  const tl = gsap.timeline();
  const tl2 = gsap.timeline();

  // refs
  const bgImageRef = useRef<HTMLElement>(null);
  const bgListContainer = useRef<HTMLDivElement>(null);
  const collectionContainer = useRef<HTMLDivElement>(null);
  const bookTextRef = useRef<HTMLDivElement>(null);

  const selectedColor = () => list[activeColorIndex]?.color;

  const selectedText = () => (
    <div className="book-text" ref={bookTextRef}>
      <h2>{list[activeIndexText]?.name}</h2>
      <p>{list[activeIndexText]?.desc}</p>
    </div>
  );

  const animateText = (isPrev = false, final = false) => {
    gsap.to(bookTextRef.current, {
      y: 15,
      ease: Expo.easeInOut as any,
      autoAlpha: 0,
      duration: 0.7,
      onComplete: () => {
        if (isPrev) {
          setActiveIndexText(
            final ? length - 1 : (activeIndexText - 1) % length
          );
        } else {
          setActiveIndexText((activeIndexText + 1) % length);
        }

        gsap.to(bookTextRef.current, {
          duration: 0.7,
          autoAlpha: 1,
          y: 0,
          ease: Expo.easeOut as any,
        });
      },
    });
  };

  const prev = (): void => {
    setDisabled(true);
    const { index, activeEl } = getActiveElement();
    const {
      activeElCollection,
      collectionElementIndex,
    } = getActiveElementCollection();

    let prevElementSibling = elementList()![index - 1];
    let prevElementSiblingCollection = collectionList()![
      collectionElementIndex - 1
    ];

    activeEl.style.zIndex = pageConstants.ACTIVE_ZINDEX;
    activeElCollection.style.zIndex = pageConstants.ACTIVE_ZINDEX;

    if (index <= 0 || collectionElementIndex <= 0) {
      animateText(true, true);
      setActiveColorIndex(length - 1);
      prevElementSibling = elementList()![length - 1];
      prevElementSiblingCollection = collectionList()![length - 1];

      animateElement(prevElementSibling, index, true, true);
      animateElement(
        prevElementSiblingCollection,
        collectionElementIndex,
        true,
        true,
        true
      );
    } else {
      animateText(true);
      setActiveColorIndex((activeColorIndex - 1) % length);

      animateElement(prevElementSibling, index, false, true);
      animateElement(
        prevElementSiblingCollection,
        collectionElementIndex,
        false,
        true,
        true
      );
    }
  };

  const next = (): void => {
    setDisabled(true);
    setActiveColorIndex((activeColorIndex + 1) % length);
    animateText();

    const { index, activeEl } = getActiveElement();
    const {
      collectionElementIndex,
      activeElCollection,
    } = getActiveElementCollection();

    let nextElementSibling = elementList()![index + 1];
    let nextElementCollectionSibling = collectionList()![
      collectionElementIndex + 1
    ];

    activeEl.style.zIndex = pageConstants.ACTIVE_ZINDEX;
    activeElCollection.style.zIndex = pageConstants.ACTIVE_ZINDEX;

    if (index + 1 >= length || collectionElementIndex + 1 >= length) {
      nextElementSibling = elementList()![0];
      nextElementCollectionSibling = collectionList()![0];

      animateElement(nextElementSibling, index, true, false);
      animateElement(
        nextElementCollectionSibling,
        collectionElementIndex,
        true,
        false,
        true
      );
    } else {
      animateElement(nextElementSibling, index, false, false);
      animateElement(
        nextElementCollectionSibling,
        collectionElementIndex,
        false,
        false,
        true
      );
    }
  };

  /**
   * @param elem - HTML element to animate
   * @param index - active element index
   * @param final - indicator when index has reached the end/ or beggining
   * @param isPrev - indicator when using inside prev method
   * @param isCollection - true if we're animating second array
   */
  const animateElement = (
    elem: HTMLElement,
    index: number,
    final = false,
    isPrev = false,
    isCollection = false
  ): void => {
    if (isCollection) {
      elem.style.clipPath = pageConstants.POLYGON_ACTIVE;
      tl2
        .to(elem, {
          duration: 0,
          autoAlpha: 1,
          zIndex: isPrev
            ? final
              ? pageConstants.ACTIVE_ZINDEX
              : pageConstants.ACTIVE_ZINDEX + 1
            : final
            ? pageConstants.ACTIVE_ZINDEX + 1
            : pageConstants.ACTIVE_ZINDEX,
        })
        .to(elem, {
          translateY: 0,
          scale: 1,
          ease: Expo.easeInOut as any,
          duration: 1.4,
          onComplete: () => {
            if (isPrev) {
              switchActiveElement(index, length - 1, true);
            } else {
              switchActiveElement(index);
            }
          },
        });
    } else {
      tl.to(elem, {
        duration: 0,
        autoAlpha: 1,
        zIndex: isPrev
          ? final
            ? pageConstants.ACTIVE_ZINDEX
            : pageConstants.ACTIVE_ZINDEX + 1
          : final
          ? pageConstants.ACTIVE_ZINDEX + 1
          : pageConstants.ACTIVE_ZINDEX,
      }).to(elem, {
        ease: Expo.easeInOut as any,
        duration: 1.4,
        translateX: 0,
        onComplete: () => {
          if (isPrev) {
            switchActiveElement(index, length - 1, true);
          } else {
            switchActiveElement(index);
          }
        },
      });
    }
  };

  const getActiveElement = () => {
    let activeElementObj = {} as {
      activeEl: HTMLElement;
      index: number;
    };
    elementList()?.forEach((el, index) => {
      if (el && el.classList && el.classList.contains('active')) {
        activeElementObj = {
          ...activeElementObj,
          activeEl: el,
          index,
        };
      }
    });
    return activeElementObj;
  };

  const getActiveElementCollection = () => {
    let activeElementObj = {} as {
      activeElCollection: HTMLElement;
      collectionElementIndex: number;
    };
    collectionList()?.forEach((el, index) => {
      if (el && el.classList && el.classList.contains('active')) {
        activeElementObj = {
          ...activeElementObj,
          activeElCollection: el,
          collectionElementIndex: index,
        };
      }
    });
    return activeElementObj;
  };

  const listExists = (): boolean | null => {
    return (
      (bgListContainer.current &&
        bgListContainer.current.children &&
        bgListContainer.current.children.length > 0) ||
      (collectionContainer.current &&
        collectionContainer.current.children &&
        collectionContainer.current.children.length > 0)
    );
  };

  const switchActiveElement = (
    index: number,
    length = elementList()!.length - 1,
    isPrev = false
  ) => {
    if (isPrev) {
      if (index <= 0) {
        elementList()![length].classList.add('active');
        collectionList()![length].classList.add('active');
        setActiveIndex(length);
        setDisabled(false);
      } else {
        elementList()![index - 1].classList.add('active');
        collectionList()![index - 1].classList.add('active');
        setActiveIndex((activeIndex - 1) % length);
        setDisabled(false);
      }
    } else {
      if (index >= length) {
        elementList()![0].classList.add('active');
        collectionList()![0].classList.add('active');
        setActiveIndex(0);
        setDisabled(false);
      } else {
        elementList()![index + 1].classList.add('active');
        collectionList()![index + 1].classList.add('active');
        setActiveIndex((activeIndex + 1) % length);
        setDisabled(false);
      }
    }

    gsap.to(elementList()![index], {
      duration: 0,
      zIndex: -1,
      autoAlpha: 0,
      translateX: pageConstants.INACTIVE_TRANSLATE,
    });
    gsap.to(collectionList()![index], {
      duration: 0,
      zIndex: -1,
      autoAlpha: 0,
      clipPath: pageConstants.POLYGON_INACTIVE,
      translateY: pageConstants.INACTIVE_TRANSLATE,
    });
    elementList()![index].classList.remove('active');
    collectionList()![index].classList.remove('active');
  };

  const elementList = useCallback((): HTMLElement[] | undefined => {
    if (listExists()) {
      return Array.prototype.slice.call(bgListContainer.current?.children);
    }
  }, []);

  const collectionList = useCallback((): HTMLElement[] | undefined => {
    if (listExists()) {
      return Array.prototype.slice.call(collectionContainer.current?.children);
    }
  }, []);

  // we are using useCallback here to ensure function is only re-created if dependencies changed
  const initElements = useCallback(() => {
    if (listExists()) {
      elementList()![pageConstants.DEFAULT_INDEX].classList.add('active');
      elementList()![pageConstants.DEFAULT_INDEX].style.zIndex =
        pageConstants.ACTIVE_ZINDEX;
      for (let i = pageConstants.DEFAULT_INDEX + 1; i < length; i++) {
        gsap.to(elementList()![i], {
          duration: 0,
          zIndex: -1,
          autoAlpha: 0,
          translateX: pageConstants.INACTIVE_TRANSLATE,
        });
      }

      collectionList()![pageConstants.DEFAULT_INDEX].classList.add('active');
      collectionList()![pageConstants.DEFAULT_INDEX].style.zIndex =
        pageConstants.ACTIVE_ZINDEX;
      for (let j = pageConstants.DEFAULT_INDEX + 1; j < length; j++) {
        gsap.to(collectionList()![j], {
          duration: 0,
          zIndex: -1,
          scale: 1.4,
          clipPath: pageConstants.POLYGON_INACTIVE,
          autoAlpha: 0,
          translateY: pageConstants.INACTIVE_TRANSLATE,
        });
      }
    }
  }, [length, collectionList, elementList]);

  useEffect(() => {
    setList(data);
    setLength(data.length);
    initElements();
  }, [list, length, initElements]);

  const renderBgList = (): JSX.Element[] =>
    list.map((l) => (
      <figure key={l.id} className="background-img" ref={bgImageRef}>
        <img src={l.url} alt={'bg img'} />
      </figure>
    ));

  const renderCollection = (): JSX.Element[] =>
    list.map((l) => (
      <figure key={l.id} className="img">
        <img src={l.url} alt={'collection img'} />
      </figure>
    ));

  return (
    <div className="collection">
      <div
        className="collection__left"
        style={{
          backgroundColor: selectedColor() && selectedColor(),
        }}
      >
        <div className="collection-actions">
          <button className="btn btn--prev" disabled={disabled} onClick={prev}>
            Previous Collection
          </button>
          <button className="btn btn--next" disabled={disabled} onClick={next}>
            Next Collection
          </button>
        </div>
        <div className="book-wrapper" ref={collectionContainer}>
          {renderCollection()}
        </div>
        {selectedText()}
      </div>
      <div className="collection__right">
        <div className="wrapper" ref={bgListContainer}>
          {renderBgList()}
        </div>
        <div className="main-title">
          <h1 className="title">Collection</h1>
          <a href={'/'} className="link">
            See full the list
          </a>
        </div>
      </div>
    </div>
  );
};
