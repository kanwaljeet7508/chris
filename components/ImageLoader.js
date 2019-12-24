import React, {Component} from 'react';
import {Thumbnail} from 'native-base';

const ImageLoader = (props) => {
    const { src, ...rest } = props;
    const opporLogo = src
    ? { uri: src  }
    : require('../assets/images/thumbnail.png');
    return <Thumbnail square  source={opporLogo} {...rest} />
}

export default ImageLoader;