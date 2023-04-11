import * as React from 'react';
import Scrollbar, { ScrollbarProps } from 'react-scrollbars-custom';

interface PropsType {
    autoHide?: boolean
    hideTimeout?: number
}

export default (props: PropsType & ScrollbarProps) => {
    const {
        autoHide = true,
        children,
        hideTimeout = 800,
        ...other
    } = props

    const [isScrolling, setIsScrolling] = React.useState(false);
    const [isMouseOver, setIsMouseOver] = React.useState(false);

    const trackStyle = React.useMemo(
        () => ({
            opacity: autoHide && !isScrolling ? 0 : 1,
            transition: "opacity 0.4s ease-out",
            background: "none"
        }),
        [autoHide, isScrolling]
    );

    const stopTimer = React.useRef<any>(null);

    const showTrack = React.useCallback(() => {
        clearTimeout(stopTimer.current);
        setIsScrolling(true);
    }, [stopTimer]);

    const hideTrack = React.useCallback(() => {
        stopTimer.current = setTimeout(() => {
            setIsScrolling(false);
        }, hideTimeout);
    }, [stopTimer, hideTimeout]);

    // const thumbYStyle: React.CSSProperties = React.useMemo(
    //     () => ({
    //         left: 2,
    //         width: 6,
    //         position: "relative"
    //     }),
    //     []
    // );

    // const wrapperStyle: React.CSSProperties = React.useMemo(
    //     () => ({
    //         right: 0,
    //         bottom: 0
    //     }),
    //     []
    // );

    // const thumbXStyle: React.CSSProperties = React.useMemo(
    //     () => ({
    //         top: 2,
    //         height: 6,
    //         position: "relative"
    //     }),
    //     []
    // );

    const onScrollStart = React.useCallback(() => {
        if (autoHide) {
            showTrack();
        }
    }, [autoHide, showTrack]);

    const onScrollStop = React.useCallback(() => {
        if (autoHide && !isMouseOver) {
            hideTrack();
        }
    }, [autoHide, hideTrack, isMouseOver]);

    const onMouseEnter = React.useCallback(() => {
        if (autoHide) {
            showTrack();
            setIsMouseOver(true);
        }
    }, [autoHide, showTrack]);

    const onMouseLeave = React.useCallback(() => {
        if (autoHide) {
            hideTrack();
            setIsMouseOver(false);
        }
    }, [autoHide, hideTrack]);

    React.useEffect(() => {
        return () => clearTimeout(stopTimer.current);
    }, []);

    return (
        <Scrollbar
            noDefaultStyles
            style={{ width: "100%", height: "100%" }}
            fallbackScrollbarWidth={15}
            // thumbYProps={{ style: thumbYStyle }}
            // thumbXProps={{ style: thumbXStyle }}
            // wrapperProps={{ style: wrapperStyle }}
            trackXProps={{ style: trackStyle, onMouseEnter, onMouseLeave }}
            trackYProps={{ style: trackStyle, onMouseEnter, onMouseLeave }}
            onScrollStop={onScrollStop}
            onScrollStart={onScrollStart}
            {...(other as any)}
        >
            {children}
        </Scrollbar>
    )
};