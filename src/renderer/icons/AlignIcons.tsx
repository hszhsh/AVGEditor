import * as React from "react";
import Icon from '@ant-design/icons';

const alignLeft = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M85.312 0v1024H0V0h85.312zM1024 256H170.688V0H1024v256z m0 768H170.688v-256H1024v256z m-170.688-384H170.688V384h682.624v256z" fill="currentColor" p-id="3986"></path>
    </svg>
)

export const AlignLeftIcon = (props: IconProps) => <Icon component={alignLeft} {...props} />;

const alignRight = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M938.688 1024V0H1024v1024h-85.312zM0 768h853.312v256H0v-256zM0 0h853.312v256H0V0z m170.688 384h682.624v256H170.688V384z" fill="currentColor" p-id="4508"></path>
    </svg>
)

export const AlignRightIcon = (props: IconProps) => <Icon component={alignRight} {...props} />;

const alignBottom = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M0 938.688h1024V1024H0v-85.312zM256 0v853.312H0V0h256z m768 0v853.312h-256V0h256z m-384 170.688v682.624H384V170.688h256z" fill="currentColor" p-id="4742"></path>
    </svg >
)

export const AlignBottomIcon = (props: IconProps) => <Icon component={alignBottom} {...props} />;

const alignTop = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M1024 85.312H0V0h1024v85.312zM768 1024V170.688h256V1024h-256zM0 1024V170.688h256V1024H0z m384-170.688V170.688h256v682.624H384z" fill="currentColor" p-id="4976"></path>
    </svg >
)

export const AlignTopIcon = (props: IconProps) => <Icon component={alignTop} {...props} />;

const alignCenter = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M460.16 1024V0h103.68v1024H460.16zM64 577.152h896v296.32H64v-296.32z m89.6-426.688h716.8v296.32H153.6v-296.32z" fill="currentColor" p-id="3848"></path>
    </svg >
)

export const AlignCenterIcon = (props: IconProps) => <Icon component={alignCenter} {...props} />;

const alignVerticalCenter = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M0 460.16h1024v103.68H0V460.16zM446.848 64v896h-296.32V64h296.32z m426.688 89.6v716.8h-296.32V153.6h296.32z" fill="currentColor" p-id="4178"></path>
    </svg >
)

export const AlignVerticalCenterIcon = (props: IconProps) => <Icon component={alignVerticalCenter} {...props} />;

const distributeHorizontal = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M1024 0v1024h-93.12V0H1024zM93.12 0v1024H0V0h93.12zM837.76 128v768H558.528V128h279.296zM465.472 128v768H186.176V128h279.296z" fill="currentColor" p-id="4460"></path>
    </svg >
)

export const DistributeHorizontalIcon = (props: IconProps) => <Icon component={distributeHorizontal} {...props} />;

const distributeVertical = () => (
    <svg width="1em" height="1em" x="0px" y="0px" viewBox="0 0 1024 1024">
        <path d="M0 0h1024v93.12H0V0z m0 930.88h1024V1024H0v-93.12zM128 186.24h768v279.296H128V186.176z m0 372.352h768v279.296H128V558.528z" fill="currentColor" p-id="4790"></path>
    </svg >
)

export const DistributeVerticalIcon = (props: IconProps) => <Icon component={distributeVertical} {...props} />;
