/*! ui-carousel.js © yamoo9.net, 2016 */

// 자바스크립트가 지원되는 환경 임을 식별할 수 있는 모듈
(function(global){
  'use strict';

  // <html> 요소를 찾아서 class 속성에서 'no-js' 값을 'js'로 변경
  global.html = query('html');

  if ( html.classList ) {
    // 신형 방식 IE 10+
    html.classList.remove('no-js');
    html.classList.add('js');
  } else {
    // 구형 방식
    var html_class_attr = html.getAttribute('class');
    // 설정
    html.setAttribute('class', html_class_attr.replace(/no-js/,'js'));
  }

}(this));

// UI Carousel 컴포넌트(Component) 제작

// -----------------------------------------------------
// 1. [절차 지향] 함수 형 방식으로 진행
// -----------------------------------------------------
// 1.1 컴퍼넌트 분석
// 애플리케이션 초기화
//  해당 요소를 컴포넌트 화
//  요소의 클래스 설정
//  버튼을 동적으로 생성
//  버튼 이벤트 핸들링
// 핸들러 작성
//  콘텐츠 래퍼를 이동 기능
// 1.2 기능 설계
// 1.3 기능 구현
// 1.4 테스트
// 1.5 빌드(배포)
(function(global){
  'use strict';


  // 모듈 내에서 사용할 공통 변수
  var carousel;
  var carousel_contents_wrapper;
  var content_height;
  var carousel_contents_total;

  // 애플리케이션 초기화
  function init(selector) {
    // 캐로셀 컴포넌트로 설정할 요소에 스타일 식별자 class 속성 설정
    carousel = query(selector);
    // var carousel = query('article');
    // 기존 carousel 참조 문서 객체의 class 속성 값을 메모리
    // 객체.속성 방식을 사용하여 메모리
    carousel.origin_class = carousel.getAttribute('class') || '';
    carousel.setAttribute('class', (carousel.origin_class + ' ui-carousel').trim() );
    // WAI-ARIA 설정
    carousel.setAttribute('role', 'application');
    carousel.setAttribute('aria-label', 'Demonstration UI Carousel Component');

    // ------------------------------------------------------------------------------
    // 래핑 요소를 생성
    carousel_contents_wrapper = createNode('div');
    // 래핑 요소에 클래스 속성 설정
    carousel_contents_wrapper.setAttribute('class', 'ui-carousel--content__wrapper');
    // 래핑 요소에 WAI-ARIA 속성 설정
    carousel_contents_wrapper.setAttribute('role', 'group');
    // 캐로셀 콘텐츠 래핑
    var carousel_contents = makeArray( queryAll(selector + '> *') );
    carousel_contents_total = carousel_contents.length;
    carousel_contents.forEach(function(content, index) {
      // 자식 요소에 class 속성 설정
      content.setAttribute('class', 'ui-carousel--content');
      // 자식 요소의 내부에서 제목 요소를 찾아 class 속성 설정
      var headline = query('h2', content);
      headline.setAttribute('class', 'ui-carousel--content__headline');
      // 래핑 요소에 자식 요소로 삽입
      carousel_contents_wrapper.appendChild(content);
    });
    // 캐로셀 컴포넌트의 첫번째 자식 요소로 삽입
    prependChild(carousel, carousel_contents_wrapper);

    // ------------------------------------------------------------------------------
    // 버튼 그룹과 버튼 요소들을 동적으로 생성
    // var button_group = createNode('div');
    // // 버튼 그룹에 class 식별자 설정
    // button_group.setAttribute('class', 'ui-carousel--navigation__buttons');
    // button_group.setAttribute('role', 'group');
    // // 버튼 생성
    // var prev_button = createNode('button');
    // prev_button.setAttribute('type', 'button');
    // var next_button = prev_button.cloneNode();
    // // 각 버튼에 class 식별자를 설정
    // prev_button.setAttribute('class', 'ui-carousel--navigation__prev_button');
    // prev_button.setAttribute('aria-label', 'previous content');
    // // 버튼에 아이콘 폰트 추가
    // prev_button.innerHTML = '<span class="fa fa-angle-up" aria-hidden="true"></span>';
    // next_button.setAttribute('class', 'ui-carousel--navigation__next_button');
    // next_button.setAttribute('aria-label', 'next content');
    // // 버튼에 아이콘 폰트 추가
    // next_button.innerHTML = '<span class="fa fa-angle-down" aria-hidden="true"></span>';
    // console.log(prev_button, next_button);

    // 콘텐츠 래퍼 문서 객체로부터 첫번째 자식 객체(콘텐트)를 변수에 참조
    var content = firstEl(carousel_contents_wrapper);
    // 콘텐트의 높이를 가져온다.
    content_height = removeUnit(css(content, 'height'));

    // 템플릿코드를 사용한 innerHTML을 활용한 예시
    var button_group_html_code = [
      '<div class="ui-carousel--navigation__buttons" role="group">',
        '<button aria-label="previous content" type="button" class="ui-carousel--navigation__prev_button">',
          '<span class="fa fa-angle-up" aria-hidden="true"></span>',
        '</button>',
        '<button aria-label="next content"type="button"class="ui-carousel--navigation__next_button">',
          '<span class="fa fa-angle-down" aria-hidden="true"></span>',
        '</button>',
      '</div>'
    ].join('');
    // console.log(button_group_html_code);
    carousel.innerHTML += button_group_html_code;

    // 버튼에 이벤트 바인딩을 하고자 한다.
    bindEvent();
  }

  // ------------------------------------------------------------------------------
  // 버튼에 이벤트 바인딩
  function bindEvent() {
    var buttons = queryAll('.ui-carousel--navigation__buttons button', carousel);
    var len = buttons.length;
    while( buttons[--len] ) {
      buttons[len].onclick = movingCarouselContents;
    }
  }

  // ------------------------------------------------------------------------------
  // 버튼에 연결된 함수
  function movingCarouselContents() {
    // 기능 구현
    // 어떤 버튼을 사용자가 클릭했는지 구분한다.
    var check_class = this.getAttribute('class');
    var carousel_contents_wrapper = prevEl(this.parentNode);
    var current_wrapper_top = removeUnit( css(carousel_contents_wrapper, 'top') );
    var changed_wrapper_top;

    // 콘텐츠 래퍼를 이동시켜 준다.
    if ( /prev/.test(check_class) ) {
      changed_wrapper_top = current_wrapper_top + content_height;
      if ( changed_wrapper_top === content_height ) {
        changed_wrapper_top = -1 * ( content_height * (carousel_contents_total - 1) );
      }
      css(carousel_contents_wrapper, 'top', changed_wrapper_top + 'px');
    } else {
      changed_wrapper_top = current_wrapper_top - content_height;
      if ( changed_wrapper_top === -1 * (content_height * carousel_contents_total) ) {
        changed_wrapper_top = 0;
      }
      css(carousel_contents_wrapper, 'top', changed_wrapper_top + 'px');
    }
  }

  // 초기화 실행
  // init('.main-ad-area');

}(this));

// -----------------------------------------------------
// 2. [객체 지향] 커스텀 객체 형태로 변경
// -----------------------------------------------------
// 2.1 객체 생성자 (ES 2015. class 제작)
// 2.2 객체 생성자의 프로토타입 객체를 통해 공유할 수 있는 기능 정의
// 2.3 정의된 기능 구현
// 2.4 테스트
// 2.5 빌드(배포)
(function(global){
  'use strict';

  // 객체 생성자 함수 정의
  function Carousel(selector) {
    this.carousel = query(selector);
    this.init();
  }

  // 생성자 함수의 프로토타입 객체 정의
  Carousel.prototype = {

    'constructor': Carousel,

    'init': function() {
      var carousel = this.carousel;
      carousel.origin_class = carousel.getAttribute('class') || '';
      carousel.setAttribute('class', (carousel.origin_class + ' ui-carousel').trim() );
      carousel.setAttribute('role', 'application');
      carousel.setAttribute('aria-label', 'Demonstration UI Carousel Component');
      var carousel_contents_wrapper = createNode('div');
      carousel_contents_wrapper.setAttribute('class', 'ui-carousel--content__wrapper');
      carousel_contents_wrapper.setAttribute('role', 'group');
      var carousel_contents = makeArray( carousel.children );
      this.carousel_contents_total = carousel_contents.length;
      carousel_contents.forEach(function(content, index) {
        content.setAttribute('class', 'ui-carousel--content');
        var headline = query('h2', content);
        headline.setAttribute('class', 'ui-carousel--content__headline');
        carousel_contents_wrapper.appendChild(content);
      });
      prependChild(carousel, carousel_contents_wrapper);
      var content = firstEl(carousel_contents_wrapper);
      this.content_height = removeUnit(css(content, 'height'));
      var button_group_html_code = [
        '<div class="ui-carousel--navigation__buttons" role="group">',
          '<button aria-label="previous content" type="button" class="ui-carousel--navigation__prev_button">',
            '<span class="fa fa-angle-up" aria-hidden="true"></span>',
          '</button>',
          '<button aria-label="next content"type="button"class="ui-carousel--navigation__next_button">',
            '<span class="fa fa-angle-down" aria-hidden="true"></span>',
          '</button>',
        '</div>'
      ].join('');
      carousel.innerHTML += button_group_html_code;
      this.bindEvent();
      // 메소드 체이닝의 핵심
      // return this;
    },

    'bindEvent': function() {
      var buttons = this.carousel.querySelectorAll('.ui-carousel--navigation__buttons button');
      var len = buttons.length;
      while( buttons[--len] ) {
        buttons[len].onclick = this.movingCarouselContents.bind(buttons[len], this);
      }
    },

    'movingCarouselContents': function(carousel) {
      var check_class = this.getAttribute('class');
      var carousel_contents_wrapper = prevEl(this.parentNode);
      var current_wrapper_top = removeUnit( css(carousel_contents_wrapper, 'top') );
      var changed_wrapper_top;
      var content_height = carousel.content_height;
      var carousel_contents_total = carousel.carousel_contents_total;
      if ( /prev/.test(check_class) ) {
        changed_wrapper_top = current_wrapper_top + content_height;
        if ( changed_wrapper_top === content_height ) {
          changed_wrapper_top = -1 * ( content_height * (carousel_contents_total - 1) );
        }
        css(carousel_contents_wrapper, 'top', changed_wrapper_top + 'px');
      } else {
        changed_wrapper_top = current_wrapper_top - content_height;
        if ( changed_wrapper_top === -1 * (content_height * carousel_contents_total) ) {
          changed_wrapper_top = 0;
        }
        css(carousel_contents_wrapper, 'top', changed_wrapper_top + 'px');
      }
    }


  };

  // 전역에 커스텀 객체 Carousel 노출
  // global.Carousel = Carousel;

}(this));

// -----------------------------------------------------
// 2-1. [객체 지향] ECMAScript 2015, Class 사용
// -----------------------------------------------------
(function(global){
  'use strict';

  // 클래스 정의
  global.Carousel = class Carousel {

    // 생성자 정의
    constructor(selector) {
      this.carousel = query(selector);
      this.init();
    }

    // 정적 메소드 추가
    static makeArray(data) {
      return global.makeArray(data);
    }

    // 초기화
    init() {
      var carousel = this.carousel;
      carousel.origin_class = carousel.getAttribute('class') || '';
      carousel.setAttribute('class', (carousel.origin_class + ' ui-carousel').trim() );
      carousel.setAttribute('role', 'application');
      carousel.setAttribute('aria-label', 'Demonstration UI Carousel Component');
      var carousel_contents_wrapper = createNode('div');
      carousel_contents_wrapper.setAttribute('class', 'ui-carousel--content__wrapper');
      carousel_contents_wrapper.setAttribute('role', 'group');
      var carousel_contents = makeArray( carousel.children );
      this.carousel_contents_total = carousel_contents.length;
      carousel_contents.forEach(function(content, index) {
        content.setAttribute('class', 'ui-carousel--content');
        var headline = query('h2', content);
        headline.setAttribute('class', 'ui-carousel--content__headline');
        carousel_contents_wrapper.appendChild(content);
      });
      prependChild(carousel, carousel_contents_wrapper);
      var content = firstEl(carousel_contents_wrapper);
      this.content_height = removeUnit(css(content, 'height'));
      var button_group_html_code = [
        '<div class="ui-carousel--navigation__buttons" role="group">',
          '<button aria-label="previous content" type="button" class="ui-carousel--navigation__prev_button">',
            '<span class="fa fa-angle-up" aria-hidden="true"></span>',
          '</button>',
          '<button aria-label="next content"type="button"class="ui-carousel--navigation__next_button">',
            '<span class="fa fa-angle-down" aria-hidden="true"></span>',
          '</button>',
        '</div>'
      ].join('');
      carousel.innerHTML += button_group_html_code;
      this.bindEvent();
    }

    bindEvent() {
      var buttons = this.carousel.querySelectorAll('.ui-carousel--navigation__buttons button');
      var len = buttons.length;
      while( buttons[--len] ) {
        buttons[len].onclick = this.movingCarouselContents.bind(buttons[len], this);
      }
    }

    movingCarouselContents(carousel) {
      var check_class = this.getAttribute('class');
      var carousel_contents_wrapper = prevEl(this.parentNode);
      var current_wrapper_top = removeUnit( css(carousel_contents_wrapper, 'top') );
      var changed_wrapper_top;
      var content_height = carousel.content_height;
      var carousel_contents_total = carousel.carousel_contents_total;
      if ( /prev/.test(check_class) ) {
        changed_wrapper_top = current_wrapper_top + content_height;
        if ( changed_wrapper_top === content_height ) {
          changed_wrapper_top = -1 * ( content_height * (carousel_contents_total - 1) );
        }
        css(carousel_contents_wrapper, 'top', changed_wrapper_top + 'px');
      } else {
        changed_wrapper_top = current_wrapper_top - content_height;
        if ( changed_wrapper_top === -1 * (content_height * carousel_contents_total) ) {
          changed_wrapper_top = 0;
        }
        css(carousel_contents_wrapper, 'top', changed_wrapper_top + 'px');
      }
    }

  };

}(this));