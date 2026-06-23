import React, { useCallback, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
// import type { RenderNodeProps } from '@backstage/plugin-catalog-graph';
type RenderNodeProps = {
  node: {
    id: string;
    entity?: {
      kind?: string;
      metadata?: { name?: string; namespace?: string; title?: string };
    };
    focused?: boolean;
  };
  onClick?: () => void;
};
const useStyles = makeStyles(theme => ({
  node: {
    fill: 'rgba(15, 23, 42, 0.95)',
    stroke: '#61DAFB',
    strokeWidth: 2.5,
    cursor: 'pointer',
    filter:
      'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',

    '&:hover': {
      stroke: '#FBBF24',
      strokeWidth: 3,
      filter:
        'drop-shadow(0 8px 20px rgba(97,218,251,0.25))',
    },

    '&.component': {
      fill: 'rgba(97,218,251,0.08)',
      stroke: '#61DAFB',
    },

    '&.api': {
      fill: 'rgba(52,211,153,0.08)',
      stroke: '#34D399',
    },

    '&.system': {
      fill: 'rgba(251,191,36,0.08)',
      stroke: '#FBBF24',
    },

    '&.domain': {
      fill: 'rgba(167,139,250,0.08)',
      stroke: '#A78BFA',
    },

    '&.group': {
      fill: 'rgba(244,114,182,0.08)',
      stroke: '#F472B6',
    },

    '&.resource': {
      fill: 'rgba(251,146,60,0.08)',
      stroke: '#FB923C',
    },
  },

  text: {
    fill: '#F1F5F9',
    fontSize: 13,
    fontWeight: 700,
    fontFamily:
      '"Fira Code","Monaco","Courier New",monospace',
    letterSpacing: '0.02em',
  },

  menu: {
    position: 'fixed',
    background:
      'rgba(15,23,42,0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(167,139,250,0.28)',
    boxShadow:
      '0 0 40px rgba(97,218,251,0.15)',
    borderRadius: 12,
    padding: '6px 0',
    zIndex: 9999,
    minWidth: 180,
  },

  menuItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 13,
    color: '#F1F5F9',

    '&:hover': {
      background:
        'rgba(97,218,251,0.08)',
      borderLeft:
        '3px solid #61DAFB',
    },
  },
}));

// Track hidden nodes globally within the session
const hiddenNodes = new Set<string>();

export function CustomRenderNode(props: RenderNodeProps) {
  const { node, onClick } = props;
  const classes = useStyles();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const nodeRef = useRef<SVGGElement>(null);

  const nodeKey = `${node.entity?.kind}:${node.entity?.metadata?.namespace}/${node.entity?.metadata?.name}`;
  const kind = node.entity?.kind?.toLowerCase();
  const name = node.entity?.metadata?.title ?? node.entity?.metadata?.name ?? nodeKey;

  // If this node was hidden, render nothing (zero-size)
  if (hiddenNodes.has(nodeKey)) {
    return <g />;
  }

  const width = 180;
  const height = 40;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handleHide = useCallback(() => {
    hiddenNodes.add(nodeKey);
    setContextMenu(null);
    // Force re-render by triggering onClick with no target — 
    // or simply let the parent graph re-render on next interaction.
    // For immediate effect, dispatch a custom event:
    window.dispatchEvent(new CustomEvent('catalog-graph:node-hidden', { detail: nodeKey }));
  }, [nodeKey]);

  const handleClose = () => setContextMenu(null);

  return (
    <>
      <g
        ref={nodeRef}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        <rect
          className={classNames(classes.node, kind)}
          width={width}
          height={height}
          rx={6}
          ry={6}
        />
        <text
          className={classes.text}
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {name.length > 22 ? `${name.slice(0, 20)}…` : name}
        </text>
      </g>

      {/* Context menu rendered in a portal-like fixed div */}
      {contextMenu && (
        <foreignObject x={0} y={0} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998 }}
            onClick={handleClose}
            onContextMenu={e => { e.preventDefault(); handleClose(); }}
          >
            <div
              className={classes.menu}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={e => e.stopPropagation()}
            >
              <div className={classes.menuItem} onClick={handleHide}>
                🙈 Hide this node
              </div>
              <div className={classes.menuItem} onClick={handleClose}>
                ✕ Close
              </div>
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
}