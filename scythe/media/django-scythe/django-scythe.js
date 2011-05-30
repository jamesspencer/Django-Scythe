var originalDismissAddAnotherPopup;

addEvent(window, 'load', function(){

  var $ = django.jQuery,
      each = $('.django-scythe'),
      targs = $('.target', each),
      clrs = $('.reset', each),
      crops = $('.crop', each),
      original_src_url = $('.django-scythe input[name="scythe_original_src_url"]').val(),
      jqm_options = {
        modal: true,
        focusInput: false,
        onShow: function(hash){
          var offset = ($(window).scrollTop() + hash.w.height() > $(document.body).height()) ? 10 : $(window).scrollTop();
          $('body').css('min-height', hash.w.height()+'px');
          hash.w.show().css('top', offset+'px');
          // $('body').height() > 
          // $(this).css()
        }
      },
      attachImgLoad = function(img, elm){
        $(img).one('load', function(){$(elm).parent().removeClass('loading').trigger('scythe-new-image', [img]);});
      },
      crop_modal = $('<div />', {'class': 'jqmWindow', css: {'display': 'none'}}).appendTo($('body')),
      createCropInterface = function(elm, orig_w, orig_h, orig_image){
        var data = $(elm).data('django-scythe'),
            html = '';
        html = '<div>';
        html += '<h1>Crop image</h1>';
        html += '<h3>Original image <small>(' + orig_w + 'px x ' + orig_h + 'px)</small></h3>';
        html += '<div class="crop-area">';
        html += '</div>';
        html += '<h3>Preview</h3>';
        html += '<div class="crop-mask" style="outline: 1px dashed #8E8E8E; background-color: #fafafa; width: 100px; height: 100px; overflow: hidden; margin-bottom: 20px;">'
        html += '</div>';
        html += '<p><input type="submit" class="save_crop" value="Save" /> <input type="submit" class="cancel_crop" value="Cancel" /> <a href="#" class="clear_crop">Clear selection</a></p>';
        html += '</div>';
        html = $(html);
        html.find('.crop-area').append(orig_image.clone());
        html.find('.crop-mask').append(orig_image.clone());
        data.modal_content = html;
      },
      showModal = function(e){
        e.preventDefault();
        e.stopPropagation();
        var cont = $(this).closest('.django-scythe');
        crop_modal.empty().append(cont.data('django-scythe').modal_content);
        crop_modal.jqmShow();
        setupCropper(cont);
      },
      setupCropper = function(elm){
          var data = elm.data('django-scythe'),
              preview_attrs = data.preview_attrs,
              scale = data.scale,
              cropbox = $('.jqmWindow .crop-area img'),
              preview = $('.jqmWindow .crop-mask img'),
              cropmask = $('.jqmWindow .crop-mask'),
              cropboxHeight = cropbox.height(),
              cropboxWidth  = cropbox.width(),
              previewHeight = data.preview_attrs.h,
              previewWidth  = data.preview_attrs.w,
              saveCrop = $('.jqmWindow .save_crop'),
              cancelCrop = $('.jqmWindow .cancel_crop'),
              clearCrop = $('.jqmWindow .clear_crop'),
              id_x = $('[name="cx"]', elm),
              id_y = $('[name="cy"]', elm),
              id_xx = $('[name="cx2"]', elm),
              id_yy = $('[name="cy2"]', elm),
              id_w = $('[name="cw"]', elm),
              id_h = $('[name="ch"]', elm),
              showPreview = function(coords)
              {
                  if(parseInt(coords.w) > 0){
                      var rx = previewWidth  / coords.w,
                          ry = previewHeight / coords.h;
                      preview.css({
                        width  : Math.round(rx * cropboxWidth  ) + 'px',
                        height : Math.round(ry * cropboxHeight ) + 'px',
                        marginLeft : '-' + Math.round(rx * coords.x) + 'px',
                        marginTop  : '-' + Math.round(ry * coords.y) + 'px'
                      });
                  };
              },
              crop_options = $.extend({
                onChange: showPreview,
                onSelect: showPreview,
                bgColor   : '#cccccc',
                bgOpacity : 0.8,
                boxWidth: 600,
                boxHeight: 600
              }, data.crop_options),
              currentCrop = getCropValues(elm);
          
          cropmask.css({'width': previewWidth+'px', 'height': previewHeight+'px'});

          crop_options.setSelect = [currentCrop.x, currentCrop.y, currentCrop.xx,  currentCrop.yy];

          data.jcrop_api =  $.Jcrop(cropbox, crop_options);

          saveCrop.click(function(e){
            e.preventDefault();
            e.stopPropagation();
            var img = $('.mini-crop img', elm),
                cropData = data.jcrop_api.tellSelect(),
                newScale = {'x': previewWidth/cropData.w, 'y': previewHeight/cropData.h};

            img.css({
              width  : Math.round(newScale.x * cropboxWidth  ) + 'px',
              height : Math.round(newScale.y * cropboxHeight ) + 'px',
              marginLeft : '-' + Math.round(newScale.x * cropData.x) + 'px',
              marginTop  : '-' + Math.round(newScale.y * cropData.y) + 'px'
            });
            setCropValues(elm, cropData['x'], cropData['y'], cropData['x2'], cropData['y2'], cropData['w'], cropData['h']);
            data.jcrop_api.destroy();
            $('.jqmWindow').jqmHide().children().remove();
          });

          cancelCrop.click(function(e){
            e.preventDefault();
            e.stopPropagation();
            data.jcrop_api.destroy();
            $('.jqmWindow').jqmHide().children().remove();
          });

          clearCrop.click(function(e){
            e.preventDefault();
            e.stopPropagation();
            data.jcrop_api.release();
          });

      },
      resetWidget = function(e){
        e && e.preventDefault();
        var cont = $(this).closest('.django-scythe');
        cont.removeClass('previous-input').addClass('no-input');
        $('.target input', cont).val('');
        $('[name="scythe_original_id"]', cont).val('');
        cont.children('.preview').find('img').remove();
      },
      setCropValues = function(elm, x,y,xx,yy,w,h){
        (x !== false) && $('[name="cx"]', elm).val(parseInt(x, 10));
        (y !== false) && $('[name="cy"]', elm).val(parseInt(y, 10));
        (xx !== false) && $('[name="cx2"]', elm).val(parseInt(xx, 10));
        (yy !== false) && $('[name="cy2"]', elm).val(parseInt(yy, 10));
        (w !== false) && $('[name="cw"]', elm).val(parseInt(w, 10));
        (h !== false) && $('[name="ch"]', elm).val(parseInt(h, 10));
      },
      getCropValues = function(elm){
        return {
          'x': parseInt($('[name="cx"]', elm).val(), 0),
          'y': parseInt($('[name="cy"]', elm).val(), 0),
          'xx': parseInt($('[name="cx2"]', elm).val(), 0),
          'yy': parseInt($('[name="cy2"]', elm).val(), 0),
          'w': parseInt($('[name="cw"]', elm).val(), 0),
          'h': parseInt($('[name="ch"]', elm).val(), 0)
        };
      },
      fetchDims = function(cont){
        var dimnames = ['', 'max_', 'min_'],
            dimvals = {},
            eachdims = false;
        for(var x = 0, y = dimnames.length; x < y; x++)
        {
          eachdims = $('input[name="'+dimnames[x]+'dims"]', cont);
          if(eachdims.length)
          {
            dimvals[dimnames[x]+'dims'] = eachdims.val().split(',');
          }
          eachdims = false;
        }
        return dimvals;
      },
      setupDims = function(elm){
        var dims = fetchDims(elm),
            crop_options = {},
            preview_attrs = {
              max_w: 600,
              max_h: 450,
              min_w: 90,
              min_h: 90
            },
            newAspect,
            scale = 1;
        if(dims.dims)
        {
          newAspect = (dims.dims[1] != 0) ? dims.dims[0]/dims.dims[1] : 1;
          preview_attrs.w = dims.dims[0];
          preview_attrs.h = dims.dims[1];
          //fixed
        }
        else
        {
          //variable
          if(dims.min_dims)
          {
            newAspect = (dims.min_dims[1] != 0) ? dims.min_dims[0]/dims.min_dims[1] : 1;
            preview_attrs.w = dims.min_dims[0];
            preview_attrs.h = dims.min_dims[1];
            crop_options.minSize = dims.min_dims;
          }
          if(dims.max_dims)
          {
            newAspect = (dims.max_dims[1] != 0) ? dims.max_dims[0]/dims.max_dims[1] : 1;
            crop_options.maxSize = dims.max_dims;
            preview_attrs.w = dims.max_dims[0];
            preview_attrs.h = dims.max_dims[1];
          }
        }
        if(preview_attrs.w > preview_attrs.max_w)
        {
          scale = preview_attrs.max_w/preview_attrs.w;
          preview_attrs.w = preview_attrs.max_w;
          preview_attrs.h = preview_attrs.max_w/newAspect;
        }
        if(preview_attrs.h > preview_attrs.max_h)
        {
          scale = preview_attrs.max_h/preview_attrs.h;
          preview_attrs.h = preview_attrs.max_h;
          preview_attrs.w = preview_attrs.max_h*newAspect;
        }
        if(preview_attrs.w < preview_attrs.min_w)
        {
          scale = preview_attrs.min_w/preview_attrs.w;
          preview_attrs.w = preview_attrs.min_w;
          preview_attrs.h = preview_attrs.min_w/newAspect;
        }
        if(preview_attrs.h < preview_attrs.min_w)
        {
          scale = preview_attrs.min_h/preview_attrs.h;
          preview_attrs.h = preview_attrs.min_h;
          preview_attrs.w = preview_attrs.min_h*newAspect;
        }
        crop_options.aspectRatio = newAspect;
        elm.data('django-scythe', {
              'preview_attrs': preview_attrs,
              'crop_options': crop_options,
              'aspect': newAspect,
              'scale': scale,
              'dims': dims
            })
            .find('.target')
            .css({'width': preview_attrs.w+'px', 'height': preview_attrs.h+'px', 'line-height': preview_attrs.h+'px'});
        elm.find('.mini-crop').css({'width': preview_attrs.w+'px', 'height': preview_attrs.h+'px'});
      },
      addNewImage = function(img, elm){
        var data = $(elm).data('django-scythe');
        data.original_image_dims = {'w': img.width, 'h': img.height};
        setCropValues(elm, 0, 0, img.width, img.width*data.aspect, img.width, img.width*data.aspect);
        createCropInterface(elm, data.original_image_dims.w, data.original_image_dims.h, $('<img />', {'src': img.src}));
        $(img).css({'width': data.preview_attrs.w+'px'}).appendTo($(elm).find('.mini-crop').empty());
      },
      getImageData = function(file, elm){
        var img = document.createElement("img"),
            reader = new FileReader();

        if (!file.type.match(/image.*/)) {
          resetWidget();
          return false;
        }

        img.classList.add("obj");
        img.file = file;

        reader.onload = (function(aImg){
          return function(e){
            attachImgLoad(aImg, elm);
            aImg.src = e.target.result;
          };
        })(img);
        reader.readAsDataURL(file);
        
      },
      processFile = function(file, elm){
        $(elm).removeClass('dropme')
               .parent()
               .removeClass('no-input')
               .addClass('loading');
        getImageData(file, elm);        
      },
      stopEvent = function(e){
        e.stopPropagation();
        e.preventDefault();
      },
      dropFile = function(e){
        e.stopPropagation();
        e.preventDefault();
        var dt = e.originalEvent.dataTransfer,
            files = dt.files;
        files && files.length > 0 && processFile(files[0], this);
      },
      highlightTrigger = function(e){
        e.stopPropagation();
        e.preventDefault();
        $(this).addClass('dropme');
      },
      unHighlightTrigger = function(e){
        e.originalTarget && e.originalTarget.nodeType != 3 && e.relatedTarget.nodeType != 3 && !$.contains(this, e.originalTarget) && $(this).removeClass('dropme');
      };
  
  
  //clobber this function so we can grab the saved original image
  originalDismissAddAnotherPopup = window.dismissAddAnotherPopup;
  window.dismissAddAnotherPopup = function(win, newId, newRepr){
    if(newRepr === 'Original object')
    {
      var img = document.createElement("img");
      $.get(original_src_url+'?id='+newId, function(data){
        var name = windowname_to_id(win.name);
        var elem = $(document.getElementById(name));
        if(data != '' && elem.length > 0)
        {
          elem.closest('.django-scythe').find('[name="scythe_original_id"]').val(newId);
          attachImgLoad(img, elem);
          img.src = data;
        }
        else
        {
          resetWidget();
        }
        win.close();
      });
    }
    else
    {
      originalDismissAddAnotherPopup(win, newId, newRepr);
    }
  };

  
  crop_modal.jqm(jqm_options);
      
  targs
    // .addClass('droppable')
    .bind({
      // 'dragenter': highlightTrigger,
      // 'dragover': stopEvent,
      // 'drop': dropFile,
      // 'dragleave': unHighlightTrigger,
      'mousemove': function(e){
        var fileInput = $('input', this),
            upload = $(this);
           fileInput.css({
             'left': e.pageX - upload.offset().left - fileInput.outerWidth() + 20,
             'top': e.pageY - upload.offset().top - 20
           }); 
      }
    })
    
  if(typeof(FileReader) == 'undefined')
  {
    targs.children('input')
      .click(function(e){
        e.preventDefault();
        $(this)
              .closest('.django-scythe')
              .removeClass('no-input')
              .addClass('loading')
              .find('.add_scythe_original')
              .click();
      });  
  }
  else
  {
    targs.children('input')
      .change(function(e){
        var files = e.currentTarget.files;
        files && files.length > 0 && processFile(files[0], $(this).closest('.target'));
      });  
  }
  each.each(function(){
      setupDims($(this));
    })
    .bind('scythe-new-image', function(e, img){
      addNewImage(img, this);
    });

  clrs.click(resetWidget);
  
  crops.click(showModal);

});


