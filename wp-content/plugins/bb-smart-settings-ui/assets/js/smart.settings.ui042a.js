(function($){
	
	NodeVisibility = {
		init: function()
		{
			NodeVisibility._checkingVisibility();

			$(window).on('resize', NodeVisibility._checkingVisibility);
		},

		_checkingVisibility: function()
		{
			if( $('body').hasClass('fl-builder-edit') )
			{
				$('.check-breakpoint').removeClass('bbsui-visibility-hidden');
				return;
			}

			var winW = $(window).width();
			if( $('.check-breakpoint').length > 0 )
			{
				$('.check-breakpoint').each(function(){
					var minW = ( ( $(this).attr('data-min-width') ) ? $(this).data('min-width') : 0 ),
						maxW = ( ( $(this).attr('data-max-width') ) ? $(this).data('max-width') : 9999 );

					if( winW >= parseInt(minW) && winW <= parseInt(maxW) )
					{
						$(this).removeClass('bbsui-visibility-hidden');
					} else {
						$(this).addClass('bbsui-visibility-hidden');
					}
				});
			}
		}
	};

	MobileAnimation = {
		init: function()
		{
			if(typeof jQuery.fn.waypoint !== 'undefined' && 0 === $('.fl-builder-edit').length && FLBuilderLayout._isMobile()) {
				$('.fl-animation').each( function() {
					var node = $( this ),
						nodeTop = node.offset().top,
						winHeight = $( window ).height(),
						bodyHeight = $( 'body' ).height(),
						offset = '80%';

					if ( bodyHeight - nodeTop < winHeight * 0.2 ) {
						offset = '100%';
					}

					node.waypoint({
						offset: offset,
						handler: FLBuilderLayout._doModuleAnimation
					});
				} );
			}
		}
	};
			
	$(function(){
		MobileAnimation.init();
		NodeVisibility.init();
	});

})(jQuery);