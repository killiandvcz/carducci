(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));

      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
            $(this),
            options.lightboxId,
            options.navigation
        );
      }

      $.fn.mauGallery.listeners(options);

      $(this)
          .children(".gallery-item")
          .each(function(index) {
            $.fn.mauGallery.methods.responsiveImageItem($(this));
            $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
            $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
            var theTag = $(this).data("gallery-tag");
            if (
                options.showTags &&
                theTag !== undefined &&
                tagsCollection.indexOf(theTag) === -1
            ) {
              tagsCollection.push(theTag);
            }
          });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
            $(this),
            options.tagsPosition,
            tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function(options) {

    $(document).on('click', '.gallery-item', function() {
      if (options.lightBox && $(this).prop('tagName') === 'IMG') {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $('.gallery').on('click', '.nav-link', function() {
      $('.nav-link').removeClass('active active-tag');
      $(this).addClass('active active-tag');
      $.fn.mauGallery.methods.filterByTag.call(this);
    });

    $('.gallery').on('click', '.mg-prev', () =>
        $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );

    $('.gallery').on('click', '.mg-next', () =>
        $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  $.fn.mauGallery.methods = {

    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
            `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
            `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      const modalId = lightboxId || 'galleryLightbox';
      const modal = $(`#${modalId}`);
      modal.find(".lightboxImage").attr("src", element.attr("src"));


      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    },

    prevImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = this.getImages(activeTag);
      let currentIndex = imagesCollection.findIndex(img => $(img).attr("src") === activeImage);

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = imagesCollection.length - 1;

      let prevImage = imagesCollection[prevIndex];
      $(".lightboxImage").attr("src", $(prevImage).attr("src"));
    },

    nextImage() {
      let activeImage = $(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = this.getImages(activeTag);
      let currentIndex = imagesCollection.findIndex(img => $(img).attr("src") === activeImage);

      let nextIndex = currentIndex + 1;
      if (nextIndex >= imagesCollection.length) nextIndex = 0;

      let nextImage = imagesCollection[nextIndex];
      $(".lightboxImage").attr("src", $(nextImage).attr("src"));
    },

    getImages(activeTag) {
      if (activeTag === 'all') {
        return $('.gallery-item').toArray();
      }
      return $('.gallery-item').filter(`[data-gallery-tag="${activeTag}"]`).toArray();
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`
        <div class="modal fade" id="${lightboxId || 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation
          ? '<button type="button" class="mg-prev" aria-label="Image précédente" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;border:none;padding:8px;">&lt;</button>'
          : ''}
                <img class="lightboxImage img-fluid" alt="Image en plein écran"/>
                ${navigation
          ? '<button type="button" class="mg-next" aria-label="Image suivante" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;border:none;padding:8px;">&gt;</button>'
          : ''}
              </div>
            </div>
          </div>
        </div>
      `);
    },

    showItemTags(gallery, position, tags) {
      var tagItems =
          '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';

      $.each(tags, function(index, value) {
        tagItems += `
          <li class="nav-item">
            <span class="nav-link" data-images-toggle="${value}">${value}</span>
          </li>`;
      });

      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Position des tags non reconnue: ${position}`);
      }
    },

    filterByTag() {
      var tag = $(this).data("images-toggle");

      if (tag === "all") {
        $(".gallery-item").parent().show(300);
        return;
      }

      $(".gallery-item").parent().hide(300);
      $(`.gallery-item[data-gallery-tag="${tag}"]`).parent().show(300);
    }
  };
})(jQuery);