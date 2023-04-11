import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setParticleLifeAction } from '../../action';
import { Key } from '@/renderer/common/utils';
import { useTypedSelector } from '@/renderer/types/types';
import { PropertyItem } from '../../PropertyItem';
import { NumericInput } from '../../input/NumericInput';

interface LifePropertyProps {
    selectedSceneNodeKey: Key,
    life: number,
    lifeVar: number,
    setLifeActionCallback: (data: { key: Key, life?: number, lifeVar?: number }) => void;
}

class LifePropertyImpl extends React.PureComponent<LifePropertyProps> {

    handleChange = (id: string, value: number) => {
        if (id == "life") {
            this.props.setLifeActionCallback({ key: this.props.selectedSceneNodeKey, life: value });
        }
        else {
            this.props.setLifeActionCallback({ key: this.props.selectedSceneNodeKey, lifeVar: value });
        }
    }

    render() {
        return (
            <PropertyItem name="Life">
                <NumericInput id="life" min={0} value={this.props.life} onChange={this.handleChange} />
                <NumericInput id="lifeVar" min={0} value={this.props.lifeVar} onChange={this.handleChange} />
            </PropertyItem>
        )
    }
}

export const LifeProperty = (props: { selectedSceneNodeKey: Key }) => {
    const dispatch = useDispatch();
    const setLifeActionCallback = React.useCallback(
        (data: { key: Key, life?: number, lifeVar?: number }) => dispatch(setParticleLifeAction(data)),
        [dispatch]
    );

    const life = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.life);
    const lifeVar = useTypedSelector(state => (state.plot.present.sceneNodeProps[props.selectedSceneNodeKey].view as ParticleElementProps).data.lifeVar);

    return (
        <LifePropertyImpl
            selectedSceneNodeKey={props.selectedSceneNodeKey}
            life={life} lifeVar={lifeVar}
            setLifeActionCallback={setLifeActionCallback}
        />
    )
}